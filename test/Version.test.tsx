import { expect, test } from "vitest";
import { Version } from '../src/Version';
import renderer from 'react-test-renderer';
import React from "react";

test("branch", () => {
    const mainBranchDescribeOutput = "heads/main";
    const component = renderer.create(
        <Version />
    )
    console.log(component);
    //expect(component).to;
})