"""Render NAITEL's original, seamless blue-light loop (no stock footage).

Requires numpy, Pillow, and ffmpeg (or imageio-ffmpeg). Runtime website has no
Python dependency. Run from any directory; outputs go to ../assets.
"""
from pathlib import Path
import argparse
import math
import shutil
import subprocess
import numpy as np
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('--ffmpeg')
args = parser.parse_args()
encoder = args.ffmpeg or shutil.which('ffmpeg')
if not encoder:
    from imageio_ffmpeg import get_ffmpeg_exe
    encoder = get_ffmpeg_exe()

assets = Path(__file__).resolve().parents[1] / 'assets'
width, height, fps, duration = 1280, 720, 24, 16
x = np.linspace(0, 1, width, dtype=np.float32)[None, :]
y = np.linspace(0, 1, height, dtype=np.float32)[:, None]
center_quiet = 1 - .72 * np.exp(-((x-.53)/.3)**2 - ((y-.5)/.3)**2)
grain = np.random.default_rng(24).uniform(-.35, .35, (height, width, 1)).astype(np.float32)

def frame(phase):
    rgb = np.empty((height, width, 3), dtype=np.float32)
    rgb[:] = (7, 17, 33)
    halo = np.exp(-((x-(.56+.05*math.sin(phase)))/.62)**2
                  - ((y-(.43+.04*math.cos(phase)))/.6)**2)
    rgb += halo[..., None] * np.array([14, 27, 42], dtype=np.float32)
    for baseline, slope, offset, color in [
        (.17, .24, 0, [57, 126, 171]),
        (.86, -.23, 2.1, [30, 101, 164]),
        (.48, -.06, 4.2, [38, 70, 119]),
    ]:
        curve = baseline + slope*x + .075*np.sin(x*math.tau + phase + offset)
        curve += .025*np.sin(x*math.tau*2 - phase + offset)
        distance = y-curve
        light = .4*np.exp(-(distance/.14)**2) + .5*np.exp(-(distance/.035)**2)
        light += .14*np.exp(-(distance/.006)**2)
        rgb += (light*center_quiet)[..., None] * np.array(color, dtype=np.float32)
    return np.clip(rgb+grain, 0, 255).astype(np.uint8)

Image.fromarray(frame(0)).save(assets/'ambient-waves-poster.jpeg', quality=90, optimize=True)
command = [encoder, '-y', '-hide_banner', '-loglevel', 'error',
           '-f', 'rawvideo', '-vcodec', 'rawvideo', '-pix_fmt', 'rgb24',
           '-s', f'{width}x{height}', '-r', str(fps), '-i', '-', '-an',
           '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
           '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
           str(assets/'ambient-waves.mp4')]
with subprocess.Popen(command, stdin=subprocess.PIPE) as process:
    for index in range(fps*duration):
        process.stdin.write(frame(math.tau*index/(fps*duration)).tobytes())
    process.stdin.close()
    result = process.wait()
    if result:
        raise SystemExit(result)
print(f'Created {duration}s loop: {(assets/"ambient-waves.mp4").stat().st_size:,} bytes')
