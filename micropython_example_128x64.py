"""Ukázka SSD1306 128x64 pro editor Mu a micro:bit V2.

Tlačítko A: text a postupně rostoucí číslo.
Tlačítko B: obdélník.
Zapojení: VCC->3V, GND->GND, SCL->P19, SDA->P20.
"""
from microbit import i2c, button_a, button_b, display, Image, sleep

ADDR = 0x3C
WIDTH = 128
HEIGHT = 64
PAGES = HEIGHT // 8
buffer = bytearray(WIDTH * PAGES)

FONT = {
    " ": (0, 0, 0, 0, 0), "-": (8, 8, 8, 8, 8), ".": (0, 96, 96, 0, 0),
    ":": (0, 54, 54, 0, 0), "%": (99, 19, 8, 100, 99),
    "0": (62, 81, 73, 69, 62), "1": (0, 66, 127, 64, 0),
    "2": (66, 97, 81, 73, 70), "3": (33, 65, 69, 75, 49),
    "4": (24, 20, 18, 127, 16), "5": (39, 69, 69, 69, 57),
    "6": (60, 74, 73, 73, 48), "7": (1, 113, 9, 5, 3),
    "8": (54, 73, 73, 73, 54), "9": (6, 73, 73, 41, 30),
    "A": (126, 17, 17, 17, 126), "B": (127, 73, 73, 73, 54),
    "C": (62, 65, 65, 65, 34), "D": (127, 65, 65, 34, 28),
    "E": (127, 73, 73, 73, 65), "F": (127, 9, 9, 9, 1),
    "G": (62, 65, 73, 73, 122), "H": (127, 8, 8, 8, 127),
    "I": (0, 65, 127, 65, 0), "J": (32, 64, 65, 63, 1),
    "K": (127, 8, 20, 34, 65), "L": (127, 64, 64, 64, 64),
    "M": (127, 2, 12, 2, 127), "N": (127, 4, 8, 16, 127),
    "O": (62, 65, 65, 65, 62), "P": (127, 9, 9, 9, 6),
    "Q": (62, 65, 81, 33, 94), "R": (127, 9, 25, 41, 70),
    "S": (70, 73, 73, 73, 49), "T": (1, 1, 127, 1, 1),
    "U": (63, 64, 64, 64, 63), "V": (31, 32, 64, 32, 31),
    "W": (63, 64, 56, 64, 63), "X": (99, 20, 8, 20, 99),
    "Y": (7, 8, 112, 8, 7), "Z": (97, 81, 73, 69, 67)
}


def command(value):
    i2c.write(ADDR, bytes([0x00, value]))


def init_oled():
    sequence = [
        0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xD3, 0x00, 0x40,
        0x8D, 0x14, 0x20, 0x00, 0xA1, 0xC8, 0xDA, 0x12,
        0x81, 0xCF, 0xD9, 0xF1, 0xDB, 0x40, 0xA4, 0xA6, 0xAF
    ]
    for value in sequence:
        command(value)


def pixel(x, y, on=True):
    if 0 <= x < WIDTH and 0 <= y < HEIGHT:
        index = x + (y // 8) * WIDTH
        mask = 1 << (y % 8)
        if on:
            buffer[index] |= mask
        else:
            buffer[index] &= 255 ^ mask


def clear():
    for i in range(len(buffer)):
        buffer[i] = 0


def show():
    for value in (0x21, 0, 127, 0x22, 0, PAGES - 1):
        command(value)
    for start in range(0, len(buffer), 16):
        i2c.write(ADDR, bytes([0x40]) + buffer[start:start + 16])


def draw_char(char, x, y, scale=1):
    columns = FONT.get(char.upper(), FONT[" "])
    for column, bits in enumerate(columns):
        for row in range(7):
            if bits & (1 << row):
                for dx in range(scale):
                    for dy in range(scale):
                        pixel(x + column * scale + dx, y + row * scale + dy)


def text(value, x, y, scale=1):
    for char in str(value):
        draw_char(char, x, y, scale)
        x += 6 * scale


def rectangle(x, y, width, height, filled=False):
    for yy in range(height):
        for xx in range(width):
            if filled or xx == 0 or yy == 0 or xx == width - 1 or yy == height - 1:
                pixel(x + xx, y + yy)


if ADDR not in i2c.scan():
    display.show(Image.NO)
    raise OSError("OLED 0x3C nebyl nalezen")

init_oled()
clear()
text("A: TEXT", 0, 18, 2)
text("B: BOX", 0, 38, 2)
show()
number = 20

while True:
    if button_a.was_pressed():
        clear()
        text("MERENI", 0, 1, 2)
        text(number, 0, 23, 5)
        show()
        number += 1

    if button_b.was_pressed():
        clear()
        rectangle(8, 8, 112, 48, False)
        show()

    sleep(20)
