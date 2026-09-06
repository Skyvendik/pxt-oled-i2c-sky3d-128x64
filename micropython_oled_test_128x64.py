"""Diagnostický test OLED SSD1306 128x64 pro micro:bit a Mu editor.

Zapojení:
    OLED VCC -> micro:bit 3V
    OLED GND -> micro:bit GND
    OLED SCL -> micro:bit P19
    OLED SDA -> micro:bit P20
"""
from microbit import i2c, display, Image, sleep

WIDTH = 128
HEIGHT = 64
PAGES = HEIGHT // 8
ADDRESS = 0x3C                 # Desetinně 60


def command(value):
    i2c.write(ADDRESS, bytes([0x00, value]))


def initialize_oled():
    # Inicializace určená přímo pro SSD1306 128x64.
    sequence = [
        0xAE,                   # Display OFF
        0xD5, 0x80,             # Clock
        0xA8, 0x3F,             # Multiplex 1/64
        0xD3, 0x00,             # Display offset
        0x40,                   # Start line 0
        0x8D, 0x14,             # Charge pump ON
        0x20, 0x00,             # Horizontal addressing
        0xA1,                   # Segment remap
        0xC8,                   # COM scan direction
        0xDA, 0x12,             # COM pins for 128x64
        0x81, 0xCF,             # Contrast
        0xD9, 0xF1,             # Pre-charge
        0xDB, 0x40,             # VCOM detect
        0xA4,                   # Display follows RAM
        0xA6,                   # Normal display
        0x2E,                   # Stop scrolling
        0xAF                    # Display ON
    ]
    for value in sequence:
        command(value)


def set_window():
    command(0x21)               # Column address
    command(0)
    command(WIDTH - 1)
    command(0x22)               # Page address
    command(0)
    command(PAGES - 1)


def send_buffer(frame):
    set_window()
    for start in range(0, len(frame), 16):
        packet = bytes([0x40]) + frame[start:start + 16]
        i2c.write(ADDRESS, packet)


def solid(value):
    send_buffer(bytes([value]) * (WIDTH * PAGES))


devices = i2c.scan()
print("Nalezene I2C adresy (desetinne):", devices)
print("Nalezene I2C adresy (hex):", [hex(device) for device in devices])

if ADDRESS not in devices:
    display.show(Image.NO)
    print("CHYBA: OLED na adrese 60/0x3C nebyl nalezen.")
    print("Zkontrolujte VCC, GND, SDA a SCL.")
else:
    display.show(Image.YES)
    display.scroll(str(ADDRESS))
    initialize_oled()

    # Třikrát otestuje úplné rozsvícení a zhasnutí všech 8192 pixelů.
    for _ in range(3):
        solid(0xFF)
        sleep(500)
        solid(0x00)
        sleep(500)

    # Finální šachovnicový vzor ověří šířku 128 px i všech 64 řádků.
    test_frame = bytearray(WIDTH * PAGES)
    for page in range(PAGES):
        for x in range(WIDTH):
            if (x + page) % 2 == 0:
                test_frame[page * WIDTH + x] = 0xAA
            else:
                test_frame[page * WIDTH + x] = 0x55

    send_buffer(test_frame)
    print("TEST HOTOV: OLED ma zobrazit sachovnicovy vzor pres celou plochu.")
