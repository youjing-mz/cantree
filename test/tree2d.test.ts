import { LSystemTree2DConfig, LSystemTree2D } from "../src/tree2d";

test("common test", () => {
    let jsonString = '{"initiator":"fF[+F]F[-F]F","angleMean":0.3490658503988659,"angleVariation":0.17453292519943295,"branchThickness":15,"branchThicknessReduction":0.65,"branchLength":30,"branchLengthReduction":0.8,"branchCurveXVariation":10,"branchCurveYVariation":5,"leafScaleVariation":0.5,"leafMinDepth":0,"leafProba":0.5,"leafScale":1,"leafTotalPerBranch":1,"leafProbaLighterMult":0.5,"shadowProba":0.2,"shadowAlpha":0.025,"shadowRadius":40,"rules":{"F":["ff","+fF","-fF","F[+FF][-FF]f","[+F][-F]","F[+fFF]","F[-fFF]","fF[+F]F[-F]"],"f":["f"],"[":["["],"]":["]"],"+":["+"],"-":["-"]},"randomSeed":1660705786408}';
    let conf = new LSystemTree2DConfig();
    Object.assign(conf, JSON.parse(jsonString));
    expect(JSON.stringify(conf) == jsonString).toBe(true);

    let tree = new LSystemTree2D(conf);
    expect(tree.currentTreeStr == 'fF[+F]F[-F]F').toBe(true);
    tree.Generate();
    expect(tree.currentTreeStr == 'fff[+F[+fFF]]F[-fFF][-fF[+F]F[-F]]fF[+F]F[-F]').toBe(true);
});
