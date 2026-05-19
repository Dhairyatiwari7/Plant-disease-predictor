"""
Model architecture for tomato disease detection.
Based on modified GoogLeNet with coordinate attention and SE blocks.

IMPORTANT: This architecture MUST match the training notebook exactly.
The training notebook uses:
  - se12 (192), se23 (480), se34 (832)
  - ca12 (192),             ca34 (832)          ← only two CA layers
  - NO ca23, NO ca4
  - Dropout p=0.5 (not 0.4)
Any deviation causes load_state_dict() to fail with unexpected/missing key errors.
"""

import torch
import torch.nn as nn
from torchvision.models import googlenet, GoogLeNet_Weights


class CoordinateAttention(nn.Module):
    """
    Coordinate Attention (Hou et al., CVPR 2021).
    Encodes spatial information along H and W axes separately,
    then fuses them to produce channel-wise + positional attention.
    """

    def __init__(self, in_channels, reduction=32):
        super().__init__()
        mid = max(8, in_channels // reduction)

        self.pool_h = nn.AdaptiveAvgPool2d((None, 1))
        self.pool_w = nn.AdaptiveAvgPool2d((1, None))

        self.conv1 = nn.Conv2d(in_channels, mid, kernel_size=1, bias=False)
        self.bn1 = nn.BatchNorm2d(mid)
        self.act = nn.Hardswish()

        self.conv_h = nn.Conv2d(mid, in_channels, kernel_size=1, bias=False)
        self.conv_w = nn.Conv2d(mid, in_channels, kernel_size=1, bias=False)

    def forward(self, x):
        B, C, H, W = x.shape

        x_h = self.pool_h(x)
        x_w = self.pool_w(x).permute(0, 1, 3, 2)

        y = torch.cat([x_h, x_w], dim=2)
        y = self.act(self.bn1(self.conv1(y)))

        x_h_, x_w_ = torch.split(y, [H, W], dim=2)
        x_w_ = x_w_.permute(0, 1, 3, 2)

        a_h = torch.sigmoid(self.conv_h(x_h_))
        a_w = torch.sigmoid(self.conv_w(x_w_))

        return x * a_h * a_w


class SEBlock(nn.Module):
    """Squeeze-and-Excitation Block for channel recalibration."""

    def __init__(self, channels, reduction=16):
        super().__init__()
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Sequential(
            nn.Linear(channels, channels // reduction),
            nn.ReLU(),
            nn.Linear(channels // reduction, channels),
            nn.Sigmoid(),
        )

    def forward(self, x):
        b, c, _, _ = x.size()
        y = self.pool(x).view(b, c)
        y = self.fc(y).view(b, c, 1, 1)
        return x * y


class ModifiedGoogLeNet(nn.Module):
    """
    GoogLeNet backbone with:
      - SE blocks (channel recalibration) + residual skip after phases 1/2/3
      - Coordinate Attention after phases 1 and 3 only
      - Global average pool → Dropout(0.5) → Linear classifier

    Layer inventory (must match saved checkpoint keys):
      phase1, phase2, phase3, phase4
      se12, se23, se34
      ca12, ca34            ← exactly two CA layers
      pool, drop, fc
    """

    def __init__(self, num_classes: int):
        super().__init__()

        base = googlenet(weights=GoogLeNet_Weights.DEFAULT)
        base.aux_logits = False
        base.aux1 = None
        base.aux2 = None

        self.phase1 = nn.Sequential(
            base.conv1, base.maxpool1,
            base.conv2, base.conv3, base.maxpool2,
        )
        self.phase2 = nn.Sequential(
            base.inception3a, base.inception3b, base.maxpool3,
        )
        self.phase3 = nn.Sequential(
            base.inception4a, base.inception4b, base.inception4c,
            base.inception4d, base.inception4e, base.maxpool4,
        )
        self.phase4 = nn.Sequential(
            base.inception5a, base.inception5b,
        )

        # SE blocks — channels match output of each phase
        self.se12 = SEBlock(192)   # after phase1 (conv3 output: 192 ch)
        self.se23 = SEBlock(480)   # after phase2 (inception3b output: 480 ch)
        self.se34 = SEBlock(832)   # after phase3 (inception4e output: 832 ch)

        # Coordinate Attention — only after phases 1 and 3 (matches training)
        self.ca12 = CoordinateAttention(192)
        self.ca34 = CoordinateAttention(832)

        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.drop = nn.Dropout(p=0.5)          # must match training (0.5)
        self.fc = nn.Linear(1024, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.phase1(x)
        x = self.se12(x) + x   # residual
        x = self.ca12(x)

        x = self.phase2(x)
        x = self.se23(x) + x   # residual

        x = self.phase3(x)
        x = self.se34(x) + x   # residual
        x = self.ca34(x)

        x = self.phase4(x)

        x = self.pool(x)
        x = torch.flatten(x, 1)
        x = self.drop(x)
        x = self.fc(x)
        return x