/**
 * Oled I2C Sky3D 128x64
 * Ovladač SSD1306 pro skutečný panel 128 × 64 pixelů.
 * Číslo 60 v názvu odpovídá výchozí I2C adrese 60 = 0x3C.
 */

//% color="#1565C0" icon="\uf26c" block="Oled I2C Sky3D 128x64"
//% groups="['Základní', 'Text', 'Grafika', 'Nastavení']"
namespace OledSky3D {
    let address = 60
    let screen = pins.createBuffer(1024)
    let started = false

    function writeCommand(command: number): void {
        const b = pins.createBuffer(2)
        b[0] = 0x00
        b[1] = command
        pins.i2cWriteBuffer(address, b, false)
    }

    function sendCommands(commands: number[]): void {
        for (let command of commands) writeCommand(command)
    }

    function update(): void {
        if (!started) return
        sendCommands([0x21, 0, 127, 0x22, 0, 7])

        // Control byte + 16 obrazových bajtů. Menší blok je spolehlivý
        // na micro:bit V1 i V2.
        const packet = pins.createBuffer(17)
        packet[0] = 0x40
        for (let offset = 0; offset < 1024; offset += 16) {
            for (let i = 0; i < 16; i++) packet[i + 1] = screen[offset + i]
            pins.i2cWriteBuffer(address, packet, false)
        }
    }

    /** Inicializuje OLED. Obvyklá adresa je 60 (0x3C). */
    //% blockId=oled_sky3d_init block="inicializuj OLED na adrese %addr"
    //% addr.defl=60 addr.min=0 addr.max=127
    //% group="Základní" weight=100
    export function init(addr: number = 60): void {
        address = addr
        sendCommands([
            0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xD3, 0x00, 0x40,
            0x8D, 0x14, 0x20, 0x00, 0xA1, 0xC8, 0xDA, 0x12,
            0x81, 0xCF, 0xD9, 0xF1, 0xDB, 0x40, 0xA4, 0xA6, 0xAF
        ])
        started = true
        clear()
    }

    /** Vymaže celý displej. */
    //% blockId=oled_sky3d_clear block="vymaž OLED"
    //% group="Základní" weight=90
    export function clear(): void {
        screen.fill(0)
        update()
    }

    /** Rozsvítí nebo zhasne celý displej – vhodné pro test. */
    //% blockId=oled_sky3d_fill block="vyplň OLED %on"
    //% on.shadow=toggleOnOff
    //% group="Základní" weight=80
    export function fill(on: boolean): void {
        screen.fill(on ? 255 : 0)
        update()
    }

    /** Zapne či vypne jeden pixel a ihned překreslí displej. */
    //% blockId=oled_sky3d_pixel block="OLED pixel x %x y %y svítí %on"
    //% x.min=0 x.max=127 y.min=0 y.max=63 on.shadow=toggleOnOff
    //% group="Grafika" weight=70
    export function pixel(x: number, y: number, on: boolean = true): void {
        if (x < 0 || x > 127 || y < 0 || y > 63) return
        const index = x + (y >> 3) * 128
        const mask = 1 << (y & 7)
        if (on) screen[index] |= mask
        else screen[index] &= ~mask
        update()
    }

    /** Nakreslí obdélník a ihned překreslí displej. */
    //% blockId=oled_sky3d_rect block="OLED obdélník x %x y %y šířka %w výška %h vyplněný %filled"
    //% x.min=0 x.max=127 y.min=0 y.max=63 w.defl=20 h.defl=10
    //% filled.shadow=toggleOnOff
    //% group="Grafika" weight=60
    export function rectangle(x: number, y: number, w: number, h: number, filled: boolean = false): void {
        for (let yy = 0; yy < h; yy++) {
            for (let xx = 0; xx < w; xx++) {
                if (filled || yy == 0 || yy == h - 1 || xx == 0 || xx == w - 1) {
                    setPixel(x + xx, y + yy, true)
                }
            }
        }
        update()
    }

    function setPixel(x: number, y: number, on: boolean): void {
        if (x < 0 || x > 127 || y < 0 || y > 63) return
        const index = x + (y >> 3) * 128
        const mask = 1 << (y & 7)
        if (on) screen[index] |= mask
        else screen[index] &= ~mask
    }

    function glyph(ch: string): string[] {
        if (ch == "0") return ["111", "101", "101", "101", "111"]
        if (ch == "1") return ["010", "110", "010", "010", "111"]
        if (ch == "2") return ["111", "001", "111", "100", "111"]
        if (ch == "3") return ["111", "001", "111", "001", "111"]
        if (ch == "4") return ["101", "101", "111", "001", "001"]
        if (ch == "5") return ["111", "100", "111", "001", "111"]
        if (ch == "6") return ["111", "100", "111", "101", "111"]
        if (ch == "7") return ["111", "001", "010", "010", "010"]
        if (ch == "8") return ["111", "101", "111", "101", "111"]
        if (ch == "9") return ["111", "101", "111", "001", "111"]
        if (ch == "-") return ["000", "000", "111", "000", "000"]
        if (ch == ".") return ["000", "000", "000", "000", "010"]
        if (ch == ":") return ["000", "010", "000", "010", "000"]
        if (ch == "A") return ["010", "101", "111", "101", "101"]
        if (ch == "B") return ["110", "101", "110", "101", "110"]
        if (ch == "C") return ["011", "100", "100", "100", "011"]
        if (ch == "D") return ["110", "101", "101", "101", "110"]
        if (ch == "E") return ["111", "100", "110", "100", "111"]
        if (ch == "F") return ["111", "100", "110", "100", "100"]
        if (ch == "G") return ["011", "100", "101", "101", "011"]
        if (ch == "H") return ["101", "101", "111", "101", "101"]
        if (ch == "I") return ["111", "010", "010", "010", "111"]
        if (ch == "J") return ["001", "001", "001", "101", "010"]
        if (ch == "K") return ["101", "101", "110", "101", "101"]
        if (ch == "L") return ["100", "100", "100", "100", "111"]
        if (ch == "M") return ["101", "111", "111", "101", "101"]
        if (ch == "N") return ["101", "111", "111", "111", "101"]
        if (ch == "O") return ["010", "101", "101", "101", "010"]
        if (ch == "P") return ["110", "101", "110", "100", "100"]
        if (ch == "Q") return ["010", "101", "101", "111", "011"]
        if (ch == "R") return ["110", "101", "110", "101", "101"]
        if (ch == "S") return ["011", "100", "010", "001", "110"]
        if (ch == "T") return ["111", "010", "010", "010", "010"]
        if (ch == "U") return ["101", "101", "101", "101", "111"]
        if (ch == "V") return ["101", "101", "101", "101", "010"]
        if (ch == "W") return ["101", "101", "111", "111", "101"]
        if (ch == "X") return ["101", "101", "010", "101", "101"]
        if (ch == "Y") return ["101", "101", "010", "010", "010"]
        if (ch == "Z") return ["111", "001", "010", "100", "111"]
        if (ch == "%") return ["101", "001", "010", "100", "101"]
        return ["000", "000", "000", "000", "000"]
    }

    function drawChar(ch: string, x: number, y: number, scale: number): void {
        const data = glyph(ch)
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 3; col++) {
                if (data[row].charAt(col) == "1") {
                    for (let sy = 0; sy < scale; sy++) {
                        for (let sx = 0; sx < scale; sx++) {
                            setPixel(x + col * scale + sx, y + row * scale + sy, true)
                        }
                    }
                }
            }
        }
    }

    function drawText(text: string, x: number, y: number, scale: number): void {
        let cursor = x
        const upper = text.toUpperCase()
        for (let i = 0; i < upper.length; i++) {
            drawChar(upper.charAt(i), cursor, y, scale)
            cursor += 4 * scale
        }
    }

    function centeredX(text: string, scale: number): number {
        return Math.max(0, Math.idiv(128 - text.length * 4 * scale, 2))
    }

    /** Zobrazí číslo na pixelových souřadnicích x, y. */
    //% blockId=oled_sky3d_number block="zobraz číslo %value na OLED x %x y %y velikost %scale"
    //% x.defl=0 x.min=0 x.max=127 y.defl=0 y.min=0 y.max=63
    //% scale.defl=2 scale.min=1 scale.max=4
    //% group="Text" weight=80
    export function showNumber(value: number, x: number = 0, y: number = 0, scale: number = 2): void {
        const text = "" + value
        drawText(text, x, y, scale)
        update()
    }

    /** Název v horním žlutém pásmu a maximálně zvětšená hodnota dole. */
    //% blockId=oled_sky3d_measurement block="OLED měření název %name hodnota %value"
    //% name.defl="TEPLOTA"
    //% group="Text" weight=100
    export function showMeasurement(name: string, value: number): void {
        screen.fill(0)
        let titleScale = 2
        if (name.length * 8 > 128) titleScale = 1
        drawText(name, centeredX(name, titleScale), 2, titleScale)
        const valueText = "" + value
        let valueScale = Math.idiv(128, Math.max(1, valueText.length * 4))
        valueScale = Math.constrain(valueScale, 1, 8)
        const valueY = 16 + Math.idiv(48 - 5 * valueScale, 2)
        drawText(valueText, centeredX(valueText, valueScale), valueY, valueScale)
        update()
    }

    /** Název nahoře a pruh odpovídající poměru hodnoty k maximu dole. */
    //% blockId=oled_sky3d_bar block="OLED pruh název %name hodnota %value maximum %maximum"
    //% name.defl="TEPLOTA" value.defl=50 maximum.defl=100
    //% group="Grafika" weight=100
    export function showBar(name: string, value: number, maximum: number = 100): void {
        screen.fill(0)
        let titleScale = 2
        if (name.length * 8 > 128) titleScale = 1
        drawText(name, centeredX(name, titleScale), 2, titleScale)
        const left = 4
        const top = 25
        const width = 120
        const height = 25
        let ratio = 0
        if (maximum > 0) ratio = Math.constrain(value / maximum, 0, 1)
        const filledWidth = Math.round((width - 4) * ratio)
        for (let x = left; x < left + width; x++) {
            setPixel(x, top, true)
            setPixel(x, top + height - 1, true)
        }
        for (let y = top; y < top + height; y++) {
            setPixel(left, y, true)
            setPixel(left + width - 1, y, true)
        }
        for (let x = 0; x < filledWidth; x++) {
            for (let y = 0; y < height - 4; y++) {
                setPixel(left + 2 + x, top + 2 + y, true)
            }
        }
        update()
    }

    /** Nastaví kontrast 0 až 255. */
    //% blockId=oled_sky3d_contrast block="nastav kontrast OLED %value"
    //% value.defl=207 value.min=0 value.max=255
    //% group="Nastavení" weight=60
    export function contrast(value: number): void {
        writeCommand(0x81)
        writeCommand(Math.constrain(value, 0, 255))
    }

    /** Inverzní zobrazení. */
    //% blockId=oled_sky3d_invert block="inverzní OLED %on"
    //% on.shadow=toggleOnOff
    //% group="Nastavení" weight=50
    export function invert(on: boolean): void {
        writeCommand(on ? 0xA7 : 0xA6)
    }

    /** Displej softwarově zapne nebo vypne. */
    //% blockId=oled_sky3d_power block="OLED zapnutý %on"
    //% on.shadow=toggleOnOff
    //% group="Nastavení" weight=40
    export function power(on: boolean): void {
        writeCommand(on ? 0xAF : 0xAE)
    }
}
