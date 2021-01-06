"use strict";

class Undoer
{
	constructor()
	{
		this.snapshots = [];
	};

	get canUndo()
	{
		return (this.snapshots.length > 0);
	};

	get lastChangeDescription()
	{
		let result = null;
		if (this.canUndo === true)
		{
			result = String(this.snapshots[this.snapshots.length - 1].description);
		};
		return result;
	};

	saveSnapshot(data, description)
	{
		if ((this.snapshots.length === 0) || (data !== this.snapshots[this.snapshots.length - 1].data))
		{
			this.snapshots.push(
			{
				"data": data,
				"description": description
			}
			);
		};
	};

	undo()
	{
		let result = null;
		if (this.canUndo === true)
		{
			result = String(this.snapshots[this.snapshots.length - 1].data);
			this.snapshots.pop();
		};
		return result;
	};

	clear()
	{
		this.snapshots = [];
	};

};
