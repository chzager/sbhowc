"use strict";

let owcMock =
{
	"resources": {},
	"settings": {},
	"specialrules": {}
};
owcMock.settings = new Settings();

// owcMock.resources = new Resources(owcMock.settings);
owcMock.resources = new Resources();
owcMock.resources.import(profilesMeta);
owcMock.resources.import(specialrulesSbh, "sbh");
owcMock.resources.import(specialrulesSgd, "sgd");
owcMock.resources.import(specialrulesSww, "sww");
owcMock.resources.import(specialrulesSdg, "sdg");
owcMock.resources.import(specialrulesSam, "sam");
// owcMock.resources.init(owcMock.settings);
// owcMock.specialrules = new Specialrules(owcMock.resources, owcMock.settings);
