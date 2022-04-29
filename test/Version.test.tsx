import { expect, test } from "vitest";
import { Version } from '../src/Version';
import renderer from 'react-test-renderer';

test("branch", () => {
    const mainBranchDescribeOutput = "heads/main";
    const component = renderer.create(
        <Version />
    )
    console.log(component);
    //expect(component).to;
})