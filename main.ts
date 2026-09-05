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
    let graphStarted = false
    let graphTitle = ""
    let graphLastY = 63

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
        graphStarted = false
        graphTitle = ""
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

    function getPixel(x: number, y: number): boolean {
        if (x < 0 || x > 127 || y < 0 || y > 63) return false
        const index = x + (y >> 3) * 128
        const mask = 1 << (y & 7)
        return (screen[index] & mask) != 0
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
        // České znaky se na malém 3×5 fontu zobrazují jako základní písmeno.
        if (ch == "Á") return glyph("A")
        if (ch == "Č") return glyph("C")
        if (ch == "Ď") return glyph("D")
        if (ch == "É" || ch == "Ě") return glyph("E")
        if (ch == "Í") return glyph("I")
        if (ch == "Ň") return glyph("N")
        if (ch == "Ó") return glyph("O")
        if (ch == "Ř") return glyph("R")
        if (ch == "Š") return glyph("S")
        if (ch == "Ť") return glyph("T")
        if (ch == "Ú" || ch == "Ů") return glyph("U")
        if (ch == "Ý") return glyph("Y")
        if (ch == "Ž") return glyph("Z")
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

    /**
     * Společný žlutý nadpis a dvě modré veličiny. Každá hodnota je
     * vykreslena na stejném řádku od nastavitelné souřadnice X.
     */
    //% blockId=oled_sky3d_two_measurements
    //% block="OLED 2 měření nadpis %title|veličina 1 %name1|hodnota 1 %value1|veličina 2 %name2|hodnota 2 %value2|hodnoty od x %valueX"
    //% title.defl="MEASUREMENT" name1.defl="TEPLOTA" value1.defl=20 name2.defl="VLHKOST" value2.defl=50
    //% valueX.defl=76 valueX.min=40 valueX.max=110
    //% inlineInputMode=external
    //% group="Text" weight=95
    export function showTwoMeasurements(title: string, name1: string, value1: number,
        name2: string, value2: number, valueX: number = 76): void {
        screen.fill(0)

        let titleScale = 2
        if (title.length * 8 > 128) titleScale = 1
        drawText(title, centeredX(title, titleScale), 2, titleScale)

        valueX = Math.constrain(valueX, 40, 110)
        let labelScale1 = 2
        let labelScale2 = 2
        if (name1.length * 8 >= valueX) labelScale1 = 1
        if (name2.length * 8 >= valueX) labelScale2 = 1

        const text1 = "" + value1
        const text2 = "" + value2
        let valueScale1 = Math.idiv(128 - valueX, Math.max(1, text1.length * 4))
        let valueScale2 = Math.idiv(128 - valueX, Math.max(1, text2.length * 4))
        valueScale1 = Math.constrain(valueScale1, 1, 3)
        valueScale2 = Math.constrain(valueScale2, 1, 3)

        drawText(name1, 1, 22, labelScale1)
        drawText(text1, valueX, 20, valueScale1)
        drawText(name2, 1, 46, labelScale2)
        drawText(text2, valueX, 44, valueScale2)
        update()
    }

    function drawSmallBar(left: number, top: number, width: number,
        height: number, value: number, maximum: number): void {
        let ratio = 0
        if (maximum > 0) ratio = Math.constrain(value / maximum, 0, 1)
        const fillWidth = Math.round((width - 4) * ratio)

        for (let x = left; x < left + width; x++) {
            setPixel(x, top, true)
            setPixel(x, top + height - 1, true)
        }
        for (let y = top; y < top + height; y++) {
            setPixel(left, y, true)
            setPixel(left + width - 1, y, true)
        }
        for (let x = 0; x < fillWidth; x++) {
            for (let y = 0; y < height - 4; y++) {
                setPixel(left + 2 + x, top + 2 + y, true)
            }
        }
    }

    /** Společný žlutý nadpis a dva samostatné modré ukazatele. */
    //% blockId=oled_sky3d_two_bars
    //% block="OLED 2 pruhy nadpis %title|veličina 1 %name1|hodnota 1 %value1|max 1 %maximum1|veličina 2 %name2|hodnota 2 %value2|max 2 %maximum2|pruhy od x %barX"
    //% title.defl="MEASUREMENT" name1.defl="TEPLOTA" value1.defl=20 maximum1.defl=100
    //% name2.defl="VLHKOST" value2.defl=50 maximum2.defl=100
    //% barX.defl=48 barX.min=30 barX.max=100
    //% inlineInputMode=external
    //% group="Grafika" weight=95
    export function showTwoBars(title: string, name1: string, value1: number,
        maximum1: number, name2: string, value2: number, maximum2: number,
        barX: number = 48): void {
        screen.fill(0)

        let titleScale = 2
        if (title.length * 8 > 128) titleScale = 1
        drawText(title, centeredX(title, titleScale), 2, titleScale)

        barX = Math.constrain(barX, 30, 100)
        let nameScale1 = 2
        let nameScale2 = 2
        if (name1.length * 8 >= barX) nameScale1 = 1
        if (name2.length * 8 >= barX) nameScale2 = 1
        drawText(name1, 1, 23, nameScale1)
        drawText(name2, 1, 47, nameScale2)

        const barWidth = 127 - barX
        drawSmallBar(barX, 21, barWidth, 14, value1, maximum1)
        drawSmallBar(barX, 45, barWidth, 14, value2, maximum2)
        update()
    }

    /**
     * Živý posuvný graf pro potenciometr, světlo, zvuk, sílu nebo napětí.
     * Blok opakovaně volejte ve smyčce; každý nový vzorek přibude zprava.
     */
    //% blockId=oled_sky3d_live_graph
    //% block="OLED živý graf název %title|hodnota %value|minimum %minimum|maximum %maximum"
    //% title.defl="MEŘENÍ" value.defl=0 minimum.defl=0 maximum.defl=1023
    //% inlineInputMode=external
    //% group="Grafika" weight=110
    export function liveGraph(title: string, value: number,
        minimum: number = 0, maximum: number = 1023): void {
        if (maximum <= minimum) maximum = minimum + 1

        // Nový graf nebo změna nadpisu vymaže předchozí obsah.
        if (!graphStarted || graphTitle != title) {
            screen.fill(0)
            let titleScale = 2
            if (title.length * 8 > 128) titleScale = 1
            drawText(title, centeredX(title, titleScale), 2, titleScale)
            graphStarted = true
            graphTitle = title
            graphLastY = 63
        }

        // Posun pouze modré části o jeden pixel doleva.
        for (let x = 0; x < 127; x++) {
            for (let y = 16; y < 64; y++) {
                setPixel(x, y, getPixel(x + 1, y))
            }
        }
        for (let y = 16; y < 64; y++) setPixel(127, y, false)

        const ratio = Math.constrain((value - minimum) / (maximum - minimum), 0, 1)
        const newY = 63 - Math.round(ratio * 47)

        // Spojení předchozího a nového vzorku zachytí i prudké špičky.
        const fromY = Math.min(graphLastY, newY)
        const toY = Math.max(graphLastY, newY)
        setPixel(126, graphLastY, true)
        for (let y = fromY; y <= toY; y++) setPixel(127, y, true)
        graphLastY = newY
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
