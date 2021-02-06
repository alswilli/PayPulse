import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { PieChartService } from 'src/app/services/pie-chart.service';
import { enterView } from '@angular/core/src/render3/instructions';
import { color } from 'd3';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {
  // private data = [
  //   {"Framework": "Vue", "Stars": "166443", "Released": "2014"},
  //   {"Framework": "React", "Stars": "150793", "Released": "2013"},
  //   {"Framework": "Angular", "Stars": "62342", "Released": "2016"},
  //   {"Framework": "Backbone", "Stars": "27647", "Released": "2010"},
  //   {"Framework": "Ember", "Stars": "21471", "Released": "2011"},
  // ];
  @Input() data: any[];
  @ViewChild('box') box: ElementRef;
  private svg;
  private margin = 95;
  width = 500;
  height = 500;
  // The radius of the pie chart is half the smallest side
  radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors;
  private path;
  private arc;
  private pie;
  private tooltip;
  newDataEventSubscription: Subscription;

  constructor(private pieChartService: PieChartService) { }

  ngOnInit(): void {
    console.log("In the pie chart component")
    this.modifyData();
    this.createSvg();
    this.createColors();
    this.createPie();
    this.drawChart();
    this.newDataEventSubscription = this.pieChartService.getNewPieDataEvent().subscribe((newData)=>{
      this.updateSvg(newData);
    })
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if(changes.data) {
  //     this.updateSvg(changes.data.currentValue);
  //   }
  // }

  public updateSvg(newData) {
    console.log("UPDATE SVG");
    console.log(newData);
    this.data = newData;
    d3.selectAll("#mypiechart").remove();
    d3.selectAll("#mypiecharttext").remove();
    // d3.selectAll("#mypiecharttext2").remove();
    // this.createSvg();
    this.modifyData()
    this.createColors();
    this.createPie();
    this.drawChart();

  }

  roundNumber(number, decimals) {
    var newnumber = new Number(number+'').toFixed(parseInt(decimals));
    return parseFloat(newnumber); 
  }

  compare(a,b) {
    if (a.total < b.total)
       return -1;
    if (a.total > b.total)
      return 1;
    return 0;
  }

  private modifyData() {
    console.log(this.data)
    var newData = []
    var grandTotal = 0
    var other = {"category" : "Other",
                 "total" : 0,
                 "percentage" : 0}
    var length = 0
    let vals = []
    for (let dataObj of this.data) {
      vals.push(dataObj.total)
      grandTotal += dataObj.total
      length += 1
    }

    for (let i = 0; i < vals.length; i++) {
      vals[i] = this.roundNumber((vals[i] / grandTotal)*100, 2)
    }
    
    for (let i = 0; i < this.data.length; i++) {
      this.data[i].percentage = vals[i]
      console.log(this.data[i].percentage)
    }

    if (length > 5) {
      console.log("MORE THAN 5")
      this.data.sort(this.compare)
      var count = length - 5 - 1
      for (let dataObj of this.data) {
        if (count > 0) {
          other.total = this.roundNumber(other.total + dataObj.total, 2)
          other.percentage = this.roundNumber(other.percentage + dataObj.percentage, 2)
          count -= 1
        }
        else{
          if (dataObj.total < grandTotal / 10) {
            other.total = this.roundNumber(other.total + dataObj.total, 2)
            other.percentage = this.roundNumber(other.percentage + dataObj.percentage, 2)
          }
          else{
            newData.push(dataObj)
          }
        }
      }
      newData.push(other)
    }
    else {
      var otherCount = 0
      console.log("LESS THAN OR EQUAL TO 5")
      for (let dataObj of this.data) {
        if (dataObj.total < grandTotal / 10) {
          other.total = this.roundNumber(other.total + dataObj.total, 2)
          other.percentage = this.roundNumber(other.percentage + dataObj.percentage, 2)
          otherCount += 1
          if (otherCount === 1) {
            other.category = dataObj.category
          }
        }
        else{
          newData.push(dataObj)
        }
      }
  
      if (other.total > 0) {
        if (otherCount > 1) {
          other.category = "Other"
        }
        newData.push(other)
      }
    }
    this.data = newData
  }

  private createSvg(): void {
    this.svg = d3.select("figure#pie")
    .append("svg")
    // .attr("width", this.width)
    // .attr("height", this.height)
    .attr("viewBox", `0 0 500 400`)
    // .style("height", "100%")
    .append("g")
    .attr(
      "transform",
      "translate(" + 250 + "," + 200 + ")"
    );

    this.tooltip = d3.select("figure#pie") // or d3.select('#bar')
    .append('div').attr('class', 'tooltip').style('display', 'none').style('opacity', 0);
  }

  private createColors(): void {
    this.colors = d3.scaleOrdinal()
    .domain(this.data.map(d => d.total.toString()))
    .range(["#c7d3ec", "#a5b8db", "#879cc4", "#677795", "#5a6782"]);
  }

  private createPie(): void {
    // Compute the position of each group on the pie:
    this.pie = d3.pie<any>().value((d: any) => Number(d.total));
    // this.pie.sort((d: any) => Number(d.total))
  }

  private drawChart(): void {
    var width = this.width
    var height = this.height
    var radius = this.radius + this.margin/3
    var box = this.box

    var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(this.radius);

    console.log(d3.select('.chart-tooltip'))
    var tooltip = this.tooltip;

    // Build the pie chart
    this.svg
    .selectAll('pieces')
    .data(this.pie(this.data))
    .enter()
    .append('path')
    .attr('fill', (d, i) => {
      console.log("COLOR: ", this.colors(i))
      return this.colors(i);
    })
    .on('mouseover', function (d, i) {
      d3.select(this).transition()
               .duration(50)
               .attr('opacity', '0.8');
      // tooltip.style('top', (arc.centroid(d)[1]) + 'px').style('left', (arc.centroid(d)[0]) + 'px')
      // tooltip.style('top', (d3.mouse(this)[1] + top + height/2) + 'px').style('left', (d3.mouse(this)[0] + left + width/2) + 'px')
      //   .style('display', 'block').style('opacity', 1).style('height', '40px')
      //   .style('position', 'absolute')
      //   .style('text-align', 'center')
      //   .style('padding', '0.5rem')
      //   .style('background', '#FFFFFF')
      //   .style('color', '#313639')
      //   .style('border', '1px solid #313639')
      //   .style('border-radius', '8px')
      //   .style('pointer-events', 'none')
      //   .style('font-size', '1.3rem')
      //   .html(`name: ${d.name}<br>value: ${d.value}<br>`);
    })
    .on('mousemove', function (s) {
      // console.log(arc.centroid(s))
      // console.log(d3.mouse(this))
      // console.log(box.nativeElement.clientWidth)
      // var relVal = box.nativeElement.clientWidth
      var top = box.nativeElement.offsetTop
      var left = box.nativeElement.offsetLeft
      var width = box.nativeElement.offsetWidth
      var height = box.nativeElement.offsetHeight
      // console.log(s)

      tooltip.style('top', (d3.mouse(this)[1] + top + height/2) + 'px').style('left', (d3.mouse(this)[0] + left + width/2) + 'px')
        .style('display', 'block').style('opacity', 1).style('height', '70px')
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('padding', '0.5rem')
        .style('background', '#FFFFFF')
        .style('color', '#313639')
        .style('border', '1px solid #313639')
        .style('border-radius', '8px')
        .style('pointer-events', 'none')
        .style('font-size', '1.3rem')
        .html(`<b>Category:</b> ${s.data.category}<br><b>Total:</b> <span>$ ${s.data.total}</span></br><b>Percentage:</b> <span> ${s.data.percentage}%</span>`);
    })
    .on('mouseout', function () {
      d3.select(this).transition()
               .duration(50)
               .attr('opacity', '1');
      tooltip.style('display', 'none').style('opacity', 0);
    })
        
    // })
    .transition()
    // .delay(function(d, i) {
    //   return i * 1000
    // })
    .duration(function(d, i) {
      return 1000
    })
    // .duration(2000)
    .attrTween('d', function(d) {
      var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
      return function(t) {
        d.endAngle = i(t);
        return arc(d);
      }
    })
    // .attr('d', d3.arc()
    //   .innerRadius(0)
    //   .outerRadius(this.radius)
    // )

    // .style('fill', 'darkOrange')
    .attr("stroke", "#121926")
    .style("stroke-width", "1px")
    .attr("id", "mypiechart");

    // Add labels
    const labelLocation = d3.arc()
    .innerRadius(this.radius / 3)
    .outerRadius(this.radius);

    this.svg
    .selectAll('pieces')
    .data(this.pie(this.data))
    .enter()
    .append('text')
    .transition()
    .delay(function(d, i) {
      return 1000
    })
    // .text(d => d.data.mainCategory + ", " +  d.data.total)
    .text(d => d.data.category)
    .attr("transform", function(d) {
      return "translate(" + 
        ( (radius - 12) * Math.sin( ((d.endAngle - d.startAngle) / 2) + d.startAngle ) ) +
        ", " +
        ( -1 * (radius - 12) * Math.cos( ((d.endAngle - d.startAngle) / 2) + d.startAngle ) ) +
      ")";

      // var c = arc.centroid(d),
      //     x = c[0],
      //     y = c[1],
      //     // pythagorean theorem for hypotenuse
      //     h = Math.sqrt(x*x + y*y);
      // return "translate(" + (x/h * radius) +  ',' +
      //  (y/h * radius) +  ")"; 

      // return "translate(" + labelLocation.centroid(d) + ")"
    })
    // .style("text-anchor", "middle")
    // .attr("text-anchor", function(d) {
    //   // are we past the center?
    //   return (d.endAngle + d.startAngle)/2 > Math.PI ?
    //       "end" : "start";
    // })
    .style("text-anchor", function(d) {
      var rads = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
      if ( (rads > 7 * Math.PI / 4 && rads < Math.PI / 4) || (rads > 3 * Math.PI / 4 && rads < 5 * Math.PI / 4) ) {
        return "middle";
      } else if (rads >= Math.PI / 4 && rads <= 3 * Math.PI / 4) {
        return "start";
      } else if (rads >= 5 * Math.PI / 4 && rads <= 7 * Math.PI / 4) {
        return "end";
      } else {
        return "middle";
      }
    })
    .style("font-size", 11)
    .attr("id", "mypiecharttext");

  }

  // var pie = d3.pie()
  //   .sort(null);

  // const pie = d3.pie<any>().value((d: any) => Number(d.total));

  // this.svg.selectAll("path")
  //   .data(pie(this.data)).exit().remove()

  // var arc = d3.arc()
  //   .innerRadius(0)
  //   .outerRadius(this.radius);


  // var path = this.svg.selectAll("path")
  //   .data(pie(this.data))
  //   .enter().append("path")
  //   .attr("fill", (d, i) => (this.colors(i)))
  //   .transition()
  //   .duration(function(d, i) {
  //     return i * 800;
  //   })
	// 	.attrTween('d', function(d) {
  //     var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
  //     return function(t) {
  //       d.endAngle = i(t);
  //       return arc(d);
  //     }
  //   });
  // }
}
