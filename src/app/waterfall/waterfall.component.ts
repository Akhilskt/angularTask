import { Component, OnInit, ElementRef, ViewEncapsulation, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
@Component({
  selector: 'app-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WaterfallComponent implements OnInit {
  hostElement;
  @Input() urlToFetch: any;
  constructor(private elRef: ElementRef, private http: HttpClient) {
    this.hostElement = this.elRef.nativeElement;
  }

  ngOnInit(): void {
    this.http.get(this.urlToFetch, { responseType: 'json' }).subscribe(data => {
      this.createChart(data['data']);
    });
  }
  dollarFormatter(n) {
    n = Math.round(n);
    var result =  Math.abs(n);
    return '$' + result.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  createChart(data) {
    var margin = { top: 60, right: 30, bottom: 60, left: 40 },
      width = this.elRef.nativeElement.parentElement.offsetWidth - margin.left - margin.right,
      height = (this.elRef.nativeElement.parentElement.offsetHeight + 300) - margin.top - margin.bottom,
      padding = 0.3;

    var x = d3.scaleBand()
      .rangeRound([0, width]).padding(padding);
    var y = d3.scaleLinear()
      .range([height, 0]);

    var xAxis = d3.axisBottom(x);
    var chart = d3.select('.chart')
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.left + margin.right + 32}`)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var cumulative = 0;
    for (var i = 0; i < data.length; i++) {
      data[i].start = cumulative;
      cumulative += parseInt(data[i].value);
      data[i].end = cumulative;
      data[i].class = (data[i].value >= 0) ? 'positive' : 'negative';
      if( i !== (data.length-1)) {
        data[i].connectorClass = data[i+1].value >= 0 ? 'positive' : 'negative';
      } else{
        data[i].connectorClass = 'last';
      }
      data[i].value = parseInt(data[i].value)
    }
    data.push({
      name: 'This Month Revenue',
      end: cumulative,
      start: 0,
      class: 'total',
    });

    x.domain(data.map(function (d) { return d.name; }));
    y.domain([0, parseInt(d3.max(data, function (d: any) { return d.end; }))]);

    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    var bar = chart.selectAll(".bar")
      .data(data)
      .enter().append("g")
      .attr("class", function (d: any) { return "bar " + d.class })
      .attr("transform", function (d: any) { return "translate(" + x(d.name) + ",0)"; });

    bar.append("rect")
      .attr("y", function (d: any) { return y(Math.max(d.start, d.end)); })
      .attr("height", function (d: any) { return Math.abs(y(d.start) - y(d.end)); })
      .attr("width", x.bandwidth());

    bar.append("text")
      .attr("x", x.bandwidth() / 2)
      .attr("y", function (d: any) { return ((d.class == 'negative') ? y(d.start) - 15 : y(d.end) - 15) })
      .text((d: any) => { return this.dollarFormatter(d.end - d.start)});

    bar.filter(function (d: any) { return d.class != "total" }).append("line")
      .attr("class", function (d: any) { return d.connectorClass})
      .attr("x1", x.bandwidth() + 5)
      .attr("y1", function (d: any) { return y(d.end) })
      .attr("x2", x.bandwidth() / (1 - padding) - 5)
      .attr("y2", function (d: any) { return y(d.end) })
  }
}
