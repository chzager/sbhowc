"use strict";

{
let unitTesting = new UnitTester("class Unit");
unitTesting.logSuccess = false;

let unit1 = new Unit();
unit1.name = "Test Unit #1";

unit1.addSpecialrule("lt", owcMock.resources);
unit1.specialrules[0].additionalText = "abc";
unitTesting.evaluate("hasSpecialrule() [1]", unit1.hasSpecialrule("lt"), true);
unitTesting.evaluate("hasSpecialrule() [2]", unit1.hasSpecialrule("xx"), false);

unit1.addSpecialrule("am", owcMock.resources);
unit1.addSpecialrule("ht", owcMock.resources);
unitTesting.evaluate("addSpecialrule()", unit1.specialrules.length, 3);

unit1.specialrules[2].additionalText = "def";
let unitString = unit1.toString();
unitTesting.evaluate("toString()", unitString, "GTest+Unit+#1*ltamht!abc!def");

let unit2 = new Unit();
unit2.fromString(unitString, "v1", owcMock.resources);
/* Unit imported fromString() must have same toString() as source unit */
unitTesting.evaluate("fromString()", unit2.toString(), unit1.toString());

unitTesting.evaluate("points [1]", unit1.points, 48);
/* new units are created with C3 Q3 which is 30 points */
unitTesting.evaluate("points [2]", new Unit().points, 30);

unitTesting.evaluate("isPersonality [1]", unit1.isPersonality, false);
unit1.addSpecialrule("ld", owcMock.resources);
unitTesting.evaluate("isPersonality [2]", unit1.isPersonality, true);

let specialrulesCount = unit1.specialrules.length;
unit1.addSpecialrule("am", owcMock.resources);
/* unit must not add specialrule that already exists -> specialrules count does not change */
/* also tests Unit.removeSpecialrule() */
unitTesting.evaluate("no duplicate specialrules [1]", unit1.specialrules.length, specialrulesCount);
/* except for specialrules that have additional texts */
unit1.addSpecialrule("ht", owcMock.resources);
unitTesting.evaluate("no duplicate specialrules [2]", unit1.specialrules.length, specialrulesCount +1);


unitTesting.end();
}
