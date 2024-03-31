export const canvasCreator = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) return;
  let context = canvas.getContext("2d");
  if (!context) return;

  const color = "#575757f0";
  const headDx = (2 * Math.PI) / 40;

  context.beginPath();

  // For drawing lines
  const drawLine = (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    lineDx: number = 2
  ) => {
    const isPositiveXDirection = toX - fromX > 0;
    const isPositiveYDirection = toY - fromY > 0;
    const lineXDx = isPositiveXDirection ? fromX + lineDx : fromX - lineDx;
    const lineYDx = isPositiveYDirection ? fromY + lineDx : fromY - lineDx;

    if (!context || (!(toX - fromX) && !(toY - fromY))) return;

    context.moveTo(fromX, fromY);
    context.lineTo(lineXDx, lineYDx);
    context.stroke();
    context.lineWidth = 1;
    context.strokeStyle = color;
    requestAnimationFrame(() =>
      drawLine(
        Math[isPositiveXDirection ? "min" : "max"](lineXDx, toX),
        Math[isPositiveYDirection ? "min" : "max"](lineYDx, toY),
        toX,
        toY,
        lineDx
      )
    );
  };

  // const drawLine = (fromX: number, fromY: number, toX: number, toY: number) => {
  //   if (!context) return;
  //   context.moveTo(fromX, fromY);
  //   context.lineTo(toX, toY);
  //   context.stroke();
  // };

  const head: CanvasPath["arc"] = (
    x,
    y,
    radius,
    startAngle,
    endAngle,
    counterclockwise = false
  ) => {
    if (!context || startAngle > endAngle) return;
    context.beginPath();
    context.arc(
      x,
      y,
      radius,
      startAngle,
      startAngle + headDx,
      counterclockwise
    );
    context.stroke();
    context.lineWidth = 2;
    context.strokeStyle = color;
    context.closePath();
    requestAnimationFrame(() =>
      head(x, y, radius, startAngle + headDx, endAngle)
    );
  };

  const body = () => {
    drawLine(
      gallowsSizes.topLineLength - 2, 
      gallowsSizes.hangerHeight + hangmanSizes.headRadius * 2, 
      gallowsSizes.topLineLength - 2, 
      gallowsSizes.hangerHeight + hangmanSizes.headRadius + hangmanSizes.bodyHeight,
      2
    );
  };

  const leftArm = () => {
    drawLine(
      gallowsSizes.topLineLength-4, 
      gallowsSizes.hangerHeight + hangmanSizes.headRadius * 2 + 30, 
      gallowsSizes.topLineLength - hangmanSizes.armLength - 2, 
      gallowsSizes.hangerHeight + hangmanSizes.headRadius * 2 + 30 - hangmanSizes.armLength,
      2
    );
  };

  const rightArm = () => {
    drawLine(
      gallowsSizes.topLineLength-2, 
      gallowsSizes.hangerHeight + hangmanSizes.headRadius * 2 + 30, 
      gallowsSizes.topLineLength + hangmanSizes.armLength, 
      gallowsSizes.hangerHeight + hangmanSizes.headRadius * 2 + 30 - hangmanSizes.armLength,
      2
    );
  };

  const leftLeg = () => {
    drawLine(
      gallowsSizes.topLineLength - 4,
      gallowsSizes.hangerHeight + hangmanSizes.headRadius + hangmanSizes.bodyHeight,
      gallowsSizes.topLineLength - 2 - hangmanSizes.legLength - 10,
      gallowsSizes.hangerHeight + hangmanSizes.headRadius + hangmanSizes.bodyHeight + hangmanSizes.legLength,
    );
  };

  const rightLeg = () => {
    drawLine(
      gallowsSizes.topLineLength - 2,
      gallowsSizes.hangerHeight + hangmanSizes.headRadius + hangmanSizes.bodyHeight,
      gallowsSizes.topLineLength - 2 + hangmanSizes.legLength + 10,
      gallowsSizes.hangerHeight + hangmanSizes.headRadius + hangmanSizes.bodyHeight + hangmanSizes.legLength,
    );
  };

  //initial frame
  const { width: canvasWidth, height: canvasHeight } = context.canvas;
  const canvasPadding = 10;

  const gallowsSizes = {
    bottomLineLength: canvasWidth - canvasPadding,
    leftLineHeight: canvasHeight - canvasPadding,
    topLineLength: ((canvasHeight - canvasPadding) / 3) * 2,
    hangerHeight: 30,
    crossSize: 15,
  };

  const hangmanSizes = {
    headRadius: 12,
    bodyHeight: 60,
    armLength: 20,
    legLength: 30,
  };

  const initialDrawing = () => {
    if (!context) return;
    // clear canvas

    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // bottom line
    drawLine(
      canvasPadding,
      gallowsSizes.leftLineHeight,
      gallowsSizes.bottomLineLength,
      gallowsSizes.leftLineHeight,
      5
    );

    // left line
    drawLine(
      canvasPadding,
      canvasPadding,
      canvasPadding,
      gallowsSizes.leftLineHeight,
      5
    );

    // top line
    drawLine(
      canvasPadding + 2,
      canvasPadding,
      gallowsSizes.topLineLength,
      canvasPadding,
      5
    );

    // hanger line
    drawLine(
      gallowsSizes.topLineLength,
      canvasPadding,
      gallowsSizes.topLineLength,
      gallowsSizes.hangerHeight,
      5
    );

    // cross top and bottom
    drawLine(
      canvasPadding,
      canvasPadding + gallowsSizes.crossSize,
      canvasPadding + gallowsSizes.crossSize,
      canvasPadding,
      1
    );
  };

  return [
    initialDrawing,
    () => head(
      gallowsSizes.topLineLength-hangmanSizes.headRadius/2+3, 
      gallowsSizes.hangerHeight+hangmanSizes.headRadius, 
      hangmanSizes.headRadius, 
      0, 
      Math.PI * 2
    ),
    body,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
  ];
};
