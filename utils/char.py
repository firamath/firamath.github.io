from __future__ import print_function
import os
import fontforge as ff


WEIGHT_LIST = ["Thin", "UltraLight", "ExtraLight", "Light", "Book", "Regular",
               "Medium", "SemiBold", "Bold", "ExtraBold", "Heavy", "Ultra"]

entry = []
for weight in WEIGHT_LIST:
    font = ff.open(os.sep.join([os.getcwd(), "assets", "FiraMath-" + weight + ".otf"]))
    unicode_list = [str(i.unicode) for i in font.glyphs() if i.unicode >= 0]
    entry.append("    \"" + font.fontname + "\": [" + ",".join(unicode_list) + "]")
    font.close()

print("var firamathChar = {\n" + ",\n".join(entry) + "\n};")
