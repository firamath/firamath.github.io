import os
import fontforge as ff


WEIGHT_LIST = ["Thin", "UltraLight", "ExtraLight", "Light", "Book", "Regular",
               "Medium", "SemiBold", "Bold", "ExtraBold", "Heavy", "Ultra"]
ESLINT_HEADER = "/* eslint-disable key-spacing, max-len, comma-spacing */"

file_str = ESLINT_HEADER + "\n"
file_str += "const firaMathChar = {\n"
for weight in WEIGHT_LIST:
    font = ff.open(os.sep.join([os.getcwd(), "assets", "FiraMath-" + weight + ".woff"]))
    unicode_list = [str(i.unicode) for i in font.glyphs() if i.unicode >= 0]
    file_str += "  '{key}': [{items}],\n".format(key=font.fontname, items=",".join(unicode_list))
    font.close()
file_str += "};"

print(file_str)
