# python3 qa/cmp.py <mockup-id> <shot-prefix> <out-prefix>
# משווה צילום (shot-prefix-d.png / -m.png) מול _kit/mockups/{desktop,mobile}/<id>.png – הדמיה מימין? לא: הדמיה משמאל, בפועל מימין
import sys, os
from PIL import Image
mid, shot, out = sys.argv[1:4]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for vp, k in (('desktop', 'd'), ('mobile', 'm')):
    a = f'{shot}-{k}.png'; b = os.path.join(root, '_kit/mockups', vp, mid + '.png')
    if not (os.path.exists(a) and os.path.exists(b)): continue
    A = Image.open(a).convert('RGB'); B = Image.open(b).convert('RGB')
    B = B.resize((A.width, int(B.height * A.width / B.width)))
    H = min(max(A.height, B.height), 6000)
    C = Image.new('RGB', (A.width * 2 + 20, H), 'red'); C.paste(B, (0, 0)); C.paste(A, (A.width + 20, 0))
    if k == 'd': C = C.resize((C.width // 2, C.height // 2))
    C.save(f'{out}-{k}.png'); print(f'{out}-{k}.png', 'mockup', B.size, 'actual', A.size)
