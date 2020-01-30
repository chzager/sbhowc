"use strict";

{

let warbandTesting = new UnitTester("class Warband");
warbandTesting.logSuccess = false;

let warband1 = new Warband();
warband1.units.push(new Unit());
warband1.units.push(new Unit());
warband1.units[0].addSpecialrule("ld", owcMock.resources);
/* 30 points plain unit + 60 points leader = 90 points total */
warbandTesting.evaluate("points", warband1.points, 90);
warbandTesting.evaluate("personalityPoints", warband1.personalityPoints, 60);

warband1.units[0].name = "Unit#1";
warband1.units[1].name = "Unit#2";
let warbandString = warband1.toString();
warbandTesting.evaluate("toString()", warbandString, "v1@GUnit#1*ld@GUnit#2@");
/* Warband imported fromString() must have same toString() as source warband */
let warband2 = new Warband();
warband2.fromString(warbandString, owcMock.resources);
warbandTesting.evaluate("fromString()", warband2.toString(), warbandString);

warbandTesting.end();

}
