"use strict";

{
let owcTesting = new UnitTester("class WarbandCreator");

let owc1 = new WarbandCreator();
owcTesting.evaluate("constructor", owc1.warband.toString(), "v1@G@");

/* "s2" must replace "s3" -> specialrules count does not change; "s3" does no more exist */
owc1.addSpecialrule(0, "s3");
let specialrulesCount2 = owc1.warband.units[0].specialrules.length;
owc1.addSpecialrule(0, "s2");
owcTesting.evaluate("specialrule.replaces [1]", owc1.warband.units[0].specialrules.length, specialrulesCount2);
owcTesting.evaluate("specialrule.replaces [2]", owc1.warband.units[0].hasSpecialrule("s3"), false);

owcTesting.end();
}
