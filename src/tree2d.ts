export class LSystemTree2DConfig {
    initiator = "fF[+F][-F]";

    rules: { [key: string]: Array<string> };

    angleMean = 20 / 180 * Math.PI;
    angleVariation = 10 / 180 * Math.PI;

    branchThickness = 12;
    branchThicknessReduction = 0.65;
    branchLength = 35;
    branchLengthReduction = 0.8;
    branchCurveXVariation = 10;
    branchCurveYVariation = 5;

    leafScaleVariation = 0.5;
    leafMinDepth = 0;
    leafProba = 0.2;
    leafScale = 1;
    leafTotalPerBranch = 2;
    leafProbaLighterMult = 0.5;

    flowerProba = 0.1;

    shadowProba = 0.2;
    shadowAlpha = 0.025;
    shadowRadius = 40;

    randomSeed: number;

    constructor(seed?: number) {
        this.rules = {};
        this.rules["F"] = ["ff", "+fF", "-fF", "F[+FF][-FF]f", "[+F][-F]", "F[+fFF]", "F[-fFF]"];
        this.rules["f"] = ["f"];
        this.rules["["] = ["["];
        this.rules["]"] = ["]"];
        this.rules["+"] = ["+"];
        this.rules["-"] = ["-"];

        if (seed) {
            this.randomSeed = seed;
        } else {
            let date = new Date();
            this.randomSeed = date.getMilliseconds();
        }

    }
}

const sleep = (time: number) => {
    return new Promise((resolve: any) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

class DrawMetricTrace {
    x = 0;
    y = 0;
    angle = 90 / 180 * Math.PI;
}

class LeafTexture {
    img: ImageBitmap;
    targetWidthInPixel = 10;
    constructor(img: ImageBitmap) { this.img = img; }
}

export class LSystemTree2D {
    currentIterations = 0;
    currentTreeStr: string;

    currentSeed = 0;

    treeConfig: LSystemTree2DConfig;
    branchCount = 0;

    posx = 0;
    posy = 0;

    branchTexture?: ImageBitmap;
    leafTextures?: LeafTexture[];
    flowerTextures?: LeafTexture[];

    canvas2d?: HTMLCanvasElement;

    constructor(treeConfig: LSystemTree2DConfig, canvas2d?: HTMLCanvasElement, branchTexture?: ImageBitmap, leafTextures?: LeafTexture[], flowerTextures?: LeafTexture[]) {
        this.treeConfig = treeConfig;

        this.canvas2d = canvas2d;
        this.branchTexture = branchTexture;
        this.leafTextures = leafTextures;
        this.flowerTextures = flowerTextures;

        this.currentTreeStr = this.treeConfig.initiator;
    }

    MathRandom(): number {
        if (this.currentSeed == 0) {
            this.currentSeed = (this.treeConfig.randomSeed * 9301 + 49297) % 233280;
        } else {
            this.currentSeed = (this.currentSeed * 9301 + 49297) % 233280;
        }
        return this.currentSeed / (233280.0);
    }

    Generate() {
        if (this.branchCount >= 1024) {
            return;
        }
        this.branchCount = 0;
        let lastTreeStr = this.currentTreeStr;
        let newTressStr = "";
        for (let i = 0; i < lastTreeStr.length; i++) {
            let c = lastTreeStr[i];
            if (c == "f") {
                ++this.branchCount;
            }
            let ruleList = this.treeConfig.rules[c];
            let ruleIndex = Math.floor(this.MathRandom() * ruleList!.length);
            newTressStr += ruleList![ruleIndex];
        }
        this.currentTreeStr = newTressStr;
        ++this.currentIterations;
    }

    GetSize() {
        let treeConfig = this.treeConfig;
        let currentBranchLength = treeConfig.branchLength;
        let currentSeed = treeConfig.randomSeed;
        let MathRandom = function (): number {
            currentSeed = (currentSeed * 9301 + 49297) % 233280;
            return currentSeed / (233280.0);
        }

        let NormalVariate = function (a: number, b: number): number {
            return a + (MathRandom() * 2 + MathRandom() * 2 + MathRandom() * 2 - 3) / 3 * b / 2;
        };
        let drawMetricTrace = new DrawMetricTrace();
        let maxTopHeight = 0;
        let maxDownHeight = 0;
        let maxLeftWidth = 0;
        let maxRightWidth = 0;
        let traceStack = [];
        let treeStr = this.currentTreeStr;
        for (let i = 0; i < treeStr.length; i++) {
            let curChar = treeStr[i];
            if (curChar == "f") {
                let growAngle = drawMetricTrace.angle;
                let growWidth = Math.cos(growAngle) * -currentBranchLength;
                drawMetricTrace.x += growWidth;
                if (drawMetricTrace.x > 0 && drawMetricTrace.x > maxRightWidth) {
                    maxRightWidth = drawMetricTrace.x;
                }
                if (drawMetricTrace.x < 0 && drawMetricTrace.x < maxLeftWidth) {
                    maxLeftWidth = drawMetricTrace.x;
                }
                let growHeight = Math.sin(growAngle) * currentBranchLength;
                drawMetricTrace.y += growHeight;
                if (drawMetricTrace.y > 0 && drawMetricTrace.y > maxTopHeight) {
                    maxTopHeight = drawMetricTrace.y;
                }
                if (drawMetricTrace.y < 0 && drawMetricTrace.y < maxDownHeight) {
                    maxDownHeight = drawMetricTrace.y;
                }
            } else if (curChar == "+") {
                drawMetricTrace.angle += NormalVariate(treeConfig.angleMean, treeConfig.angleVariation);
            } else if (curChar == "-") {
                drawMetricTrace.angle -= NormalVariate(treeConfig.angleMean, treeConfig.angleVariation);
            } else if (curChar == "[") {
                currentBranchLength *= treeConfig.branchLengthReduction;
                let drawMetricTraceClone = new DrawMetricTrace();
                drawMetricTraceClone.x = drawMetricTrace.x;
                drawMetricTraceClone.y = drawMetricTrace.y;
                drawMetricTraceClone.angle = drawMetricTrace.angle;
                traceStack.push(drawMetricTraceClone);
            } else if (curChar == "]") {
                currentBranchLength *= 1 / treeConfig.branchLengthReduction;
                drawMetricTrace = traceStack.pop()!;
            }
        }
        console.log("maxTopHeight", maxTopHeight, "maxDownHeight", maxDownHeight, "maxLeftWidth", maxLeftWidth, "maxRightWidth", maxRightWidth);
    }

    SetPosition(x : number, y : number) {
        this.posx = x;
        this.posy = y;
    }

    async Draw() {
        let drawError: Error;
        let canvasContext2d = this.canvas2d!.getContext("2d")!;
        canvasContext2d.save();
        canvasContext2d.setTransform(1, 0, 0, 1, 0, 0);
        canvasContext2d.translate(this.posx, this.posy);
        let treeConfig = this.treeConfig;
        let currentBranchLength = treeConfig.branchLength;
        let currentSeed = treeConfig.randomSeed;
        let MathRandom = function (): number {
            currentSeed = (currentSeed * 9301 + 49297) % 233280;
            return currentSeed / (233280.0);
        }

        let NormalVariate = function (a: number, b: number): number {
            return a + (MathRandom() * 2 + MathRandom() * 2 + MathRandom() * 2 - 3) / 3 * b / 2;
        };

        let count = 0;
        try {
            let branchPattern = canvasContext2d.createPattern(this.branchTexture!, "repeat");
            canvasContext2d.strokeStyle = branchPattern!;
            canvasContext2d.lineWidth = treeConfig.branchThickness;
            canvasContext2d.lineCap = "round";
            let depth = 1;
            let treeStr = this.currentTreeStr;
            for (let i = 0; i < treeStr.length; i++) {
                // if (count < this.branchCount / 7) {
                //     canvasContext2d.strokeStyle = "yellow";
                // }
                // else if (count < this.branchCount * 2 / 7) {
                //     canvasContext2d.strokeStyle = "pink";
                // }
                // else if (count <  this.branchCount * 3 / 7) {
                //     canvasContext2d.strokeStyle = "green";
                // }
                // else if (count <  this.branchCount * 4 / 7) {
                //     canvasContext2d.strokeStyle = "orange";
                // }
                // else if (count <  this.branchCount * 5 / 7) {
                //     canvasContext2d.strokeStyle = "blue";
                // }
                // else if (count <  this.branchCount * 6 / 7) {
                //     canvasContext2d.strokeStyle = "purple";
                // }
                // else if (count <  this.branchCount * 7 / 7) {
                //     canvasContext2d.strokeStyle = "red";
                // }
                let curChar = treeStr[i];
                if (curChar == "f") {
                    ++count;
                    canvasContext2d.beginPath();
                    canvasContext2d.moveTo(0, 0);
                    canvasContext2d.quadraticCurveTo(NormalVariate(0, treeConfig.branchCurveXVariation), NormalVariate(0, treeConfig.branchCurveYVariation) - currentBranchLength / 2, 0, -currentBranchLength);
                    canvasContext2d.stroke();
                    if (MathRandom() <= treeConfig.shadowProba) {
                        canvasContext2d.save();
                        canvasContext2d.globalCompositeOperation = "source-atop";
                        canvasContext2d.globalAlpha = treeConfig.shadowAlpha;
                        canvasContext2d.beginPath();
                        canvasContext2d.arc(0, 0, treeConfig.shadowRadius, 0, Math.PI * 2, false);
                        canvasContext2d.fill();
                        canvasContext2d.restore()
                    }
                    canvasContext2d.translate(0, -currentBranchLength);
                    for (let j = 0; j < treeConfig.leafTotalPerBranch; j++) {
                        let proba = Math.random();
                        if (this.flowerTextures && this.flowerTextures.length > 0 && depth >= treeConfig.leafMinDepth && proba <= treeConfig.flowerProba) {
                            canvasContext2d.save();
                            if (MathRandom() <= (depth / this.currentIterations * treeConfig.leafProbaLighterMult)) {
                                canvasContext2d.globalCompositeOperation = "lighter"
                            }
                            let imgIndex = Math.floor(MathRandom() * this.flowerTextures.length);
                            let flowerImg = this.flowerTextures[imgIndex];
                            let scale = flowerImg.targetWidthInPixel / flowerImg.img.width * treeConfig.leafScale;
                            canvasContext2d.scale(scale * (1 + (MathRandom() * 2 - 1) * treeConfig.leafScaleVariation), scale * (1 + (MathRandom() * 2 - 1) * treeConfig.leafScaleVariation));
                            canvasContext2d.rotate(MathRandom() * Math.PI * 2);
                            canvasContext2d.drawImage(flowerImg.img, 0, 0);
                            canvasContext2d.restore();
                        }
                        else if (this.leafTextures && this.leafTextures.length > 0 && depth >= treeConfig.leafMinDepth && proba <= treeConfig.leafProba) {
                            canvasContext2d.save();
                            let imgIndex = Math.floor(MathRandom() * this.leafTextures.length);
                            let leafImg = this.leafTextures[imgIndex];
                            let scale = leafImg.targetWidthInPixel / leafImg.img.width * treeConfig.leafScale;
                            canvasContext2d.scale(scale * (1 + (MathRandom() * 2 - 1) * treeConfig.leafScaleVariation), scale * (1 + (MathRandom() * 2 - 1) * treeConfig.leafScaleVariation));
                            canvasContext2d.rotate(MathRandom() * Math.PI * 2);
                            canvasContext2d.drawImage(leafImg.img, 0, 0);
                            canvasContext2d.restore();
                        }
                    }
                    await sleep(10);
                } else if (curChar == "+") {
                    canvasContext2d.rotate(NormalVariate(treeConfig.angleMean, treeConfig.angleVariation))
                } else if (curChar == "-") {
                    canvasContext2d.rotate(-NormalVariate(treeConfig.angleMean, treeConfig.angleVariation))
                } else if (curChar == "[") {
                    canvasContext2d.save();
                    currentBranchLength *= treeConfig.branchLengthReduction;
                    depth++;
                    canvasContext2d.lineWidth *= treeConfig.branchThicknessReduction;
                } else if (curChar == "]") {
                    currentBranchLength *= 1 / treeConfig.branchLengthReduction;
                    depth--;
                    canvasContext2d.restore()
                }
            }
        } catch (err) {
            drawError = err
        }
        canvasContext2d.restore();
        return drawError!;
    }
}

export function RandomGenerate(canvas2d: HTMLCanvasElement, branchTextures: ImageBitmap[], leafTextures: ImageBitmap[], flowerTextures: ImageBitmap[]) : LSystemTree2D  {
    let branchIndex = Math.floor(Math.random() * branchTextures.length);
    let finalBranchTexture = branchTextures[branchIndex];

    let finalLeafTextures = [];
    let finalFlowerTextures = [];
    if (leafTextures && leafTextures.length > 0) {
        let imgIndex = Math.floor(Math.random() * leafTextures.length);
        let leafTexture = new LeafTexture(leafTextures[imgIndex]);
        leafTexture.targetWidthInPixel = 10;
        finalLeafTextures.push(leafTexture);
    }
    if (flowerTextures && flowerTextures.length > 0 && Math.random() > 0.5) {
        let imgIndex = Math.floor(Math.random() * flowerTextures.length);
        let flowerTexture = new LeafTexture(flowerTextures[imgIndex]);
        flowerTexture.targetWidthInPixel = 8;
        finalFlowerTextures.push(flowerTexture);
    }


    let date = new Date();
    let treeConfig = new LSystemTree2DConfig(Math.random() * date.getMilliseconds());
    let tree = new LSystemTree2D(treeConfig, canvas2d, finalBranchTexture, finalLeafTextures, finalFlowerTextures);
    for (let i = 0; i < 10; i++) {
        tree.Generate();
    }

    return tree;
}


export async function RandomForest(canvas2d: HTMLCanvasElement, branchTextures: ImageBitmap[], leafTextures: ImageBitmap[], flowerTextures: ImageBitmap[])  {
    let tileWidth = 800;
    let tileHeight = 600;
    let xCount = (canvas2d.width / tileWidth);
    let yCount = (canvas2d.height / tileHeight);
    let trees = [];
    for (let i = 0; i < xCount; ++i) {
        for (let j = 0; j < yCount; ++j) {
            let tree = RandomGenerate(canvas2d, branchTextures, leafTextures, flowerTextures);
            tree.SetPosition((i + 1)* 600, (j + 0.5) * 600 + 300);
            trees.push(tree);
        }
    }

    for (let i = 0; i < trees.length; i++) {
       await trees[i].Draw();
    }
}

