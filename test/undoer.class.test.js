"use strict";

let undoerTesting = new UnitTester("class Undoer");
undoerTesting.logSuccess = false;

let undoer1 = new Undoer();
undoer1.saveSnapshot("a", "first");
undoerTesting.evaluate("saveSnapshot()", undoer1.snapshots.length, 1);
undoer1.saveSnapshot("a", "first again");
undoerTesting.evaluate("no duplicate snapshots", undoer1.snapshots.length, 1);

undoer1.saveSnapshot("b", "second");
let undoState = undoer1.undo();
undoerTesting.evaluate("undo() [1]", undoState, "b");
undoerTesting.evaluate("undo() [2]", undoer1.snapshots.length, 1);

undoerTesting.evaluate("lastChangeDescription", undoer1.lastChangeDescription, "first");

undoerTesting.evaluate("canUndo() [1]", undoer1.canUndo, true);

undoer1.clear();
undoerTesting.evaluate("canUndo() [2]", undoer1.canUndo, false);

undoerTesting.end();
