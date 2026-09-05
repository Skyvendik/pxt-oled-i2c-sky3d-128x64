OledSky3D.init(60)
OledSky3D.showMeasurement("TEPLOTA", 25)
basic.pause(1000)
OledSky3D.showBar("TEPLOTA", 50, 100)
basic.pause(1000)
OledSky3D.showTwoMeasurements("MEASUREMENT", "TEPLOTA", 20, "VLHKOST", 50, 76)
basic.pause(1000)
OledSky3D.showTwoBars("MEASUREMENT", "TEPLOTA", 20, 100, "VLHKOST", 50, 100, 48)
basic.pause(1000)
for (let index = 0; index <= 100; index += 5) {
    OledSky3D.liveGraph("MERENI", index, 0, 100)
}
