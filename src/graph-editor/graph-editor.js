angular.module('app')

.controller('graphEditorController', function () {

})

.component('graphEditor', {

  bindings: {
    id: '@'
  },

  controller: function ($log, $window, Neo4jService, $http) {

    var self = this;

    self.data = null;

    self.$onInit = function () {
      $http.get('http://localhost:8888/diagrams/12').then(
        function (res) {
          self.data = res.data;
          self.neo4jd3.updateWithD3Data(self.data);
        },
        function (err) {
          $log.error(err);
        }
      );
    };

    self.$onChanges = function (changes) {
      if(changes.id) {
        if(changes.id.currentValue) {
          $log.debug('NEO4JD3 INIT', changes.id.currentValue);
          self.init(changes.id.currentValue, self.data);
          // self.neo4jd3.updateWithD3Data(self.data);
          // self.neo4jd3.randomD3Data(5);
        }
      }
    }

    self.init = function (id, data) {

      self.neo4jd3 = new $window.Neo4jD3('#' + id, {
        // d3Data: {
        //   nodes: [],
        //   relationships: []
        // },
        neo4jDataUrl: 'assets/data/json',
        highlight: [
          {
            class: 'Project',
            property: 'name',
            value: 'neo4jd3'
          }, {
            class: 'User',
            property: 'userId',
            value: 'eisman'
          }
        ],
        // icons: {
        //   // 'Address': 'home',
        //   // 'Api': 'gear',
        //   // 'BirthDate': 'birthday-cake',
        //   // 'Cookie': 'paw',
        //   // 'CreditCard': 'credit-card',
        //   // 'Device': 'laptop',
        //   // 'Email': 'at',
        //   // 'Git': 'git',
        //   // 'Github': 'github',
        //   // 'Google': 'google',
        //   // 'icons': 'font-awesome',
        //   // 'Ip': 'map-marker',
        //   // 'Issues': 'exclamation-circle',
        //   // 'Language': 'language',
        //   // 'Options': 'sliders',
        //   // 'Password': 'lock',
        //   // 'Phone': 'phone',
        //   // 'Project': 'folder-open',
        //   // 'SecurityChallengeAnswer': 'commenting',
        //   // 'User': 'user',
        //   // 'zoomFit': 'arrows-alt',
        //   // 'zoomIn': 'search-plus',
        //   // 'zoomOut': 'search-minus'
        // },
        // colorMap: {
        //   'server': '#E8260C',
        //   'software': '#FF4400',
        //   'database': '#FF0D22'
        // },
        // images: {
        //   'server': 'assets/icons/server.svg',
        //   // 'software': 'assets/icons/software.svg',
        //   // 'service offered': 'assets/icons/service-offered.svg'
        //  },
        // imageUrlPrefix: 'assets/icons/',
        // imageUrlSuffix: '.svg',
        minCollision: 50,
        nodeRadius: 24,
        onNodeDoubleClick: function (node) {
          switch(node.id) {
            case '25':
              // Google
              $window.open(node.properties.url, '_blank');
              break;
            default:
              var maxNodes = 5;
              var data = self.neo4jd3.randomD3Data(node, maxNodes);
              self.neo4jd3.updateWithD3Data(data);
              break;
          }
        },
        onRelationshipDoubleClick: function (relationship) {
          $log.debug('double click on relationship: ' + angular.toJson(relationship));
        },
        zoomFit: true
      });
    };


    // self.$onInit = function () {
    //   $log.debug($scope.id);
    // };
    //
    // self.$onChanges = function (changes) {
    //   if(changes.id) {
    //     self.color = d3.scaleOrdinal(d3.schemeCategory10);
    //     self.svg = d3.select(changes.id.currentValue).append("svg");
    //     self.svg.attr("width", "100%")
    //     self.svg.attr("height", "100%");
    //     self.svg = self.svg.call(d3.zoom().on("zoom", zoomed)).append("g");
    //     self.simulation =
    //       d3.forceSimulation()
    //         .force("link", d3.forceLink().id(function (d) { return d.id; }))
    //         .force("y", d3.forceY(0))
    //         .force("x", d3.forceX(0))
    //         .force("charge", d3.forceManyBody())
    //         .force("collide", d3.forceCollide().radius(function (d) { return (d.type + 1) * 10; }).iterations(2))
    //         .force("center", d3.forceCenter(0, 0));
    //     // createGraph(false, data);
    //   }
    // };

    // function createGraph (error, graph) {
    //
    //   if (error) throw error;
    //
    //   var link = self.svg.append("g")
    //     .attr("class", "links")
    //     .selectAll("line")
    //     .data(graph.links)
    //     .enter().append("line")
    //       .attr("stroke", function (d) { return color(d.type); });
    //
    //   var node = self.svg.append("g")
    //     .attr("class", "nodes")
    //     .selectAll("circle")
    //     .data(graph.nodes)
    //     .enter().append("circle")
    //       .attr("r", function (d) { return (d.type + 1) * 2 })
    //       .attr("fill", function (d) { if (d.root == "true") return color(d.root); return color(d.type); })
    //       .call(d3.drag()
    //         .on("start", dragstarted)
    //         .on("drag", dragged)
    //         .on("end", dragended));
    //
    //   node.on("click",function (d){
    //     $log.debug("clicked", d.id);
    //   });
    //
    //   node.append("title").text(function (d) { return d.id; });
    //
    //   self.simulation
    //     .nodes(graph.nodes)
    //     .on("tick", ticked);
    //
    //   self.simulation.force("link").links(graph.links);
    //
    //   function ticked () {
    //     link
    //       .attr("x1", function (d) { return d.source.x; })
    //       .attr("y1", function (d) { return d.source.y; })
    //       .attr("x2", function (d) { return d.target.x; })
    //       .attr("y2", function (d) { return d.target.y; });
    //     node
    //       .attr("cx", function (d) { return d.x; })
    //       .attr("cy", function (d) { return d.y; });
    //   }
    // }
    //
    // function dragstarted (d) {
    //   if (!d3.event.active) self.simulation.alphaTarget(0.1).restart();
    //   d.fx = d.x;
    //   d.fy = d.y;
    // }
    //
    // function dragged (d) {
    //   d.fx = d3.event.x;
    //   d.fy = d3.event.y;
    // }
    //
    // function dragended (d) {
    //   if (!d3.event.active) self.simulation.alphaTarget(0);
    //   d.fx = null;
    //   d.fy = null;
    // }
    //
    // function zoomed () {
    //   svg.attr("transform", "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ")" + " scale(" + d3.event.transform.k + ")");
    // }
    //
    // function resize () {
    //   var c = d3.select(id);
    //   var g = c.node().getBoundingClientRect();
    //   $log.debug('RESIZE', g.width, g.height);
    //   // svg.attr("width", g.width);
    //   c.attr("height", "100%");
    //   self.svg.attr("height", g.height + "px");
    //   simulation.force("link", d3.forceLink().id(function (d) { return d.id; }))
    //       .force("charge", d3.forceManyBody())
    //       .force("center", d3.forceCenter(g.width / 2, g.height / 2))
    //       // .alpha(0.3)
    //       .restart();
    // }
    //
    // d3.select(window).on('resize', resize);

  }

});
