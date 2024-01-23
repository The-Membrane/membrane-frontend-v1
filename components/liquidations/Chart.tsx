type ChartProps = {
    barGraph: any; // replace with the actual type of bar
    barIndex: number;
    setPremium: (value: number) => void;
    premium: number | undefined;
  };
  

  const Chart: React.FC<ChartProps> = ({ barGraph, barIndex, setPremium, premium }) => {
    return (
      <>
          <div className="bar-icon" data-descr={barGraph[barIndex][0].tvl} style={{height: barGraph[barIndex][0].height, backgroundColor: barGraph[barIndex][0].color,}}/>
          <div className="bar-icon1" data-descr={barGraph[barIndex][1].tvl} style={{height: barGraph[barIndex][1].height, backgroundColor: barGraph[barIndex][1].color,}}/>
          <div className="bar-icon2" data-descr={barGraph[barIndex][2].tvl} style={{height: barGraph[barIndex][2].height, backgroundColor: barGraph[barIndex][2].color,}}/>
          <div className="bar-icon3" data-descr={barGraph[barIndex][3].tvl} style={{height: barGraph[barIndex][3].height, backgroundColor: barGraph[barIndex][3].color,}}/>
          <div className="bar-icon4" data-descr={barGraph[barIndex][4].tvl} style={{height: barGraph[barIndex][4].height, backgroundColor: barGraph[barIndex][4].color,}}/>
          <div className="bar-icon5" data-descr={barGraph[barIndex][5].tvl} style={{height: barGraph[barIndex][5].height, backgroundColor: barGraph[barIndex][5].color,}}/>
          <div className="bar-icon6" data-descr={barGraph[barIndex][6].tvl} style={{height: barGraph[barIndex][6].height, backgroundColor: barGraph[barIndex][6].color,}}/>
          <div className="bar-icon7" data-descr={barGraph[barIndex][7].tvl} style={{height: barGraph[barIndex][7].height, backgroundColor: barGraph[barIndex][7].color,}}/>
          <div className="bar-icon8" data-descr={barGraph[barIndex][8].tvl} style={{height: barGraph[barIndex][8].height, backgroundColor: barGraph[barIndex][8].color,}}/>
          <div className="bar-icon9" data-descr={barGraph[barIndex][9].tvl} style={{height: barGraph[barIndex][9].height, backgroundColor: barGraph[barIndex][9].color,}}/>
          <div className="label4" data-tvl={barGraph[barIndex][0].tvl} style={(premium === 0) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(0)}}>0%</div>
          <div className="label5" data-tvl={barGraph[barIndex][1].tvl} style={(premium === 1) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(1)}}>1%</div>
          <div className="label6" data-tvl={barGraph[barIndex][2].tvl} style={(premium === 2) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(2)}}>2%</div>
          <div className="label7" data-tvl={barGraph[barIndex][3].tvl} style={(premium === 3) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(3)}}>3%</div>
          <div className="label8" data-tvl={barGraph[barIndex][4].tvl} style={(premium === 4) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(4)}}>4%</div>
          <div className="label9" data-tvl={barGraph[barIndex][5].tvl} style={(premium === 5) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(5)}}>5%</div>
          <div className="label10" data-tvl={barGraph[barIndex][6].tvl} style={(premium === 6) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(6)}}>6%</div>
          <div className="label11" data-tvl={barGraph[barIndex][7].tvl} style={(premium === 7) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(7)}}>7%</div>
          <div className="label12" data-tvl={barGraph[barIndex][8].tvl} style={(premium === 8) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(8)}}>8%</div>
          <div className="label13" data-tvl={barGraph[barIndex][9].tvl} style={(premium === 9) ? {color:"rgba(79, 202, 187, 0.8)"} : undefined} onClick={()=>{setPremium(9)}}>9%</div>         
      </>
    );
  };
  
  export default Chart;