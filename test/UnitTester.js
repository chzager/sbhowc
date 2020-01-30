"use strict";

class UnitTester
{
	constructor(id)
	{
		this.id = id;
		this.logSuccess = true;
		this.successes = [];
		console.group("Testing " + id);
	};

	end()
	{
		if (this.logSuccess === false)
		{
			console.info(String(this.successes.length) + " tests passed successfully:", this.successes.join(", "));
		}
		console.groupEnd();
	};

	evaluate(testName, testValue, expectedResult)
	{
		if (testValue === expectedResult)
		{
			if (this.logSuccess === true)
			{
				console.info("Test \"" + testName + "\" passed");
			}
			else
			{
				this.successes.push(testName);
			}
		}
		else
		{
			let details =
			{
				"expected": expectedResult,
				"got": testValue
			}
			console.error("Test \"" + testName + "\"", "failed", details);
		}
	};

};
