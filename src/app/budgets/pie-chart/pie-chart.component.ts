import { Component, OnInit, Input } from '@angular/core';
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
  private svg;
  private margin = 50;
  private width = 750;
  private height = 562;
  // The radius of the pie chart is half the smallest side
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors;
  private path;
  private arc;
  private pie;
  newDataEventSubscription: Subscription;

  constructor(private pieChartService: PieChartService) { }

  ngOnInit(): void {
    console.log("In the pie chart component")
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
    // this.createSvg();
    this.createColors();
    this.createPie();
    this.drawChart();

  }

  private createSvg(): void {
    this.svg = d3.select("figure#pie")
    .append("svg")
    // .attr("width", this.width)
    // .attr("height", this.height)
    .attr("viewBox", `0 0 562 480`)
    .append("g")
    .attr(
      "transform",
      "translate(" + this.width / 2.7 + "," + this.height / 2.42 + ")"
    );
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

    var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(this.radius);

    // Build the pie chart
    this.svg
    .selectAll('pieces')
    .data(this.pie(this.data))
    .enter()
    .append('path')
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

    .attr('fill', (d, i) => {
      console.log("COLOR: ", this.colors(i))
      return this.colors(i);
    })
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
    .text(d => d.data.mainCategory + ", " +  d.data.total)
    .attr("transform", d => "translate(" + labelLocation.centroid(d) + ")")
    .style("text-anchor", "middle")
    .style("font-size", 15)
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
