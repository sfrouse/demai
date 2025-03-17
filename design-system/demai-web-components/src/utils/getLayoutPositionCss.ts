export enum LayoutPositions {
  'Top Left' = 'top-left',
  'Top Right' = 'top-right',
  'Top Center' = 'top-center',
  'Left Center' = 'center-left',
  'Right Center' = 'center-right',
  'Center' = 'center-center',
  'Bottom Center' = 'bottom-center',
  'Bottom Left' = 'bottom-left',
  'Bottom Right' = 'bottom-right'
}

export default function getLayoutPositionCss(
  position: LayoutPositions,
  verticalOffset: number,
  horizontalOffset: number
) {
  let output = [];
  
  const finalVertOffset =  verticalOffset !== undefined ? verticalOffset : 0;
  const finalHorzOffset =  horizontalOffset !== undefined ? horizontalOffset : 0;

  if (position === LayoutPositions.Center) {
      output.push(`left: 50%;`);
      output.push(`top: 50%;`);
      output.push(`transform: translate(-50%, -50%);`);
  }else{
    if (position.indexOf('top') !== -1) {
      output.push(`top: ${finalVertOffset}%;`);
    }else if (position.indexOf('bottom') !== -1) {
      output.push(`bottom: ${finalVertOffset}%;`);
    }else{
      output.push(`top: calc( 50% + ${finalVertOffset}% );`);
      output.push(`transform: translate(0, -50%);`);
    }
  
    if (position.indexOf('left') !== -1) {
      output.push(`left: ${finalHorzOffset}%;`);
    }else if (position.indexOf('right') !== -1) {
      output.push(`right: ${finalHorzOffset}%;`);
    }else{
      output.push(`left: calc( 50% + ${finalHorzOffset}% );`);
      output.push(`transform: translate(-50%);`);
    }
  }
  return output.join('\n');
}