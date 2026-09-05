# Oled I2C Sky3D 128x64

Rozšíření Microsoft MakeCode pro micro:bit a OLED SSD1306 128 × 64 přes I²C.

Výchozí I²C adresa displeje je 60 (`0x3C`).

## Zapojení

| OLED | micro:bit |
|---|---|
| VCC | 3V |
| GND | GND |
| SCL | P19 |
| SDA | P20 |

## První test

1. Použij blok `inicializuj OLED na adrese 60`.
2. Použij `vyplň OLED ano`.
3. Po pauze použij `vyplň OLED ne`.

## Import do MakeCode

Nahraj tyto soubory do veřejného GitHub repozitáře. V MakeCode zvol
**Rozšíření**, vlož adresu repozitáře a vyber rozšíření.

Pro lokální úpravu lze v JavaScriptovém editoru MakeCode otevřít průzkumník
projektu a obsah souboru `main.ts` vložit do balíčku rozšíření.

## Dvoubarevné zobrazení

U žluto-modrého OLED jsou barvy určené konstrukcí panelu: řádky 0–15 jsou
žluté a řádky 16–63 modré. Blok `OLED měření` vloží název do horního pásma
a automaticky zvětšenou hodnotu do spodního pásma. Blok `OLED pruh` používá
stejné rozdělení; délku pruhu počítá jako `hodnota / maximum`. Opakovaným
voláním s rostoucí hodnotou pruh narůstá.

Blok `OLED 2 měření` zobrazuje společný nadpis a dva řádky název–hodnota.
Parametr `hodnoty od x` určuje vodorovnou pozici obou hodnot. Blok
`OLED 2 pruhy` zobrazuje dva samostatné ukazatele; parametr `pruhy od x`
určuje, kde začínají. Všechny tři názvy lze měnit přímo v blocích.

Blok `OLED živý pruh` využívá celé modré pásmo jako silný dynamický ukazatel.
Pruh začíná na levém okraji a podle aktuální hodnoty roste doprava. Parametry
`minimum` a `maximum` určují měřicí rozsah. Pro analogový vstup micro:bitu se
obvykle používá rozsah 0 až 1023.

Blok `OLED průběhový graf` kreslí časový průběh zleva doprava. Po dosažení
128 vzorků posouvá starší hodnoty doleva. Automatické měřítko vyhledá minimum
a maximum z viditelných vzorků a využije celou výšku modré plochy. Pevné
měřítko používá zadané minimum a maximum a je vhodné pro porovnávání měření.

## Licence

MIT

for PXT/microbit
