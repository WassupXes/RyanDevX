#!/usr/bin/env python3
"""Cut the Studio recordings into short, muted web loops for the site.

Usage: python3 tools/cut_clips.py <folder with the original .mp4 recordings>
Writes site/assets/clips/<key>.mp4 + <key>.jpg (poster). Originals are not committed.
Each spec: key -> [(source file suffix, crop preset, start, end, speed), ...] joined in order.
"""
import pathlib
import subprocess
import sys

OUT = pathlib.Path(__file__).resolve().parent.parent / "site/assets/clips"
CROPS = {  # Studio viewport only (no ribbon, chat, dock or menu bar)
    "rec": "1154:822:2:236",      # 1920x1246 screen recordings
    "studio": "1130:804:2:190",   # 1134x1080 Studio-only timelapse
    "drone": "802:572:174:74",    # 1150x816 drone render, burnt-in caption cropped off
}
W, H = 960, 684
TL, REC = "00_timelapse_roblox_only_10x", "rec"
SPECS = {
    "hero":   [(TL, "studio", 0, 14.5, 1.6), (TL, "studio", 19.5, 23, 1), (TL, "studio", 28, 36, 2), (TL, "studio", 48, 55, 2),
               (TL, "studio", 68, 76, 2), ("08_drone_view", "drone", 4, 22, 2.5)],
    "build":  [("01_build_replay", REC, 0, 50, 3.5)],
    "lobby":  [("04_user_testing_shop_misi_tembak", REC, 5, 11.5, 1)],
    "inside": [("07_bug_hunt_jumppad_fix", REC, 104, 122, 2)],
    "undo":   [("03_undo_satu_klik", REC, 7, 16, 1.5), ("03_undo_satu_klik", REC, 28, 40, 1.5)],
    "qa":     [("04_user_testing_shop_misi_tembak", REC, 12, 66, 5), ("04_user_testing_shop_misi_tembak", REC, 76, 92, 4)],
    "runs":   [("04_user_testing_shop_misi_tembak", REC, 96, 140, 4), ("04_user_testing_shop_misi_tembak", REC, 186, 206, 4)],
    "secure": [("05_anti_exploit_shield", REC, 3, 24, 2.5)],
    "shield": [("05_anti_exploit_shield", REC, 24, 81, 4)],
    "review": [("06_agent_review_bug_ide", REC, 0, 24, 2)],
    "drone":  [("08_drone_view", "drone", 4, 40, 3)],
    "skins":  [("04_user_testing_shop_misi_tembak", REC, 26, 62, 3)],
    "scan":   [("02_api_check_migrate_backdoor", REC, 0, 36, 3)],
}

# Timeline stills on the homepage: name -> (clip key, second)
STILLS = {"t-map": ("build", 13.6), "t-lobby": ("lobby", 1.0), "t-play": ("hero", 15.2),
          "t-qa": ("qa", 9.6), "t-shield": ("shield", 10.6), "t-review": ("review", 10.0),
          "rev-night": ("undo", 4.0)}  # squad board thumbnail


def find(src_dir, suffix):
    hits = sorted(src_dir.glob(f"*{suffix}.mp4"))
    if not hits:
        raise SystemExit(f"missing recording: *{suffix}.mp4")
    return hits[0]


def cut(src_dir, key, segs):
    srcs = list(dict.fromkeys(seg[0] for seg in segs))
    parts, labels = [], []
    for i, (suffix, crop, a, b, x) in enumerate(segs):
        parts.append(f"[{srcs.index(suffix)}:v]trim={a}:{b},setpts=(PTS-STARTPTS)/{x},crop={CROPS[crop]},"
                     f"scale={W}:{H}:flags=lanczos,fps=24,setsar=1[s{i}]")
        labels.append(f"[s{i}]")
    graph = ";".join(parts) + f";{''.join(labels)}concat=n={len(segs)}:v=1:a=0[v]"
    inputs = [arg for suffix in srcs for arg in ("-i", str(find(src_dir, suffix)))]
    mp4 = OUT / f"{key}.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[v]", "-an",
                    "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", "30", "-preset", "slow",
                    "-g", "48", "-movflags", "+faststart", str(mp4)], check=True)
    # WebM copy for browsers without H.264 (the page lists it as a second <source>)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp4), "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "40", "-row-mt", "1",
                    "-deadline", "good", "-cpu-used", "4", "-an", str(OUT / f"{key}.webm")], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp4), "-frames:v", "1", "-q:v", "5", str(OUT / f"{key}.jpg")], check=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp4)],
                               capture_output=True, text=True).stdout)
    print(f"{key:8} {dur:5.1f}s {mp4.stat().st_size / 1e6:5.2f} MB")


if __name__ == "__main__":
    src_dir = pathlib.Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    only = sys.argv[2:]
    for key, segs in SPECS.items():
        if not only or key in only:
            cut(src_dir, key, segs)
    for name, (key, sec) in STILLS.items():
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(sec), "-i", str(OUT / f"{key}.mp4"), "-frames:v", "1",
                        "-vf", "scale=400:-2", "-q:v", "4", str(OUT / f"{name}.jpg")], check=True)
