angular.module('app')

.controller('nodeEditorController', function ($log, Neo4jService) {

  var vm = this;

  vm.nodeId = null;

  vm.node = null;

  vm.findNode = function () {
    Neo4jService.getNode(vm.nodeId).then(function (data) {
      vm.node = Neo4jService.toObject(data);
      vm.node.edges = {};
      Neo4jService.getConnections(vm.node.id, true).then(function (data) {
        $log.debug('NOED', 'outgoing', data);
        vm.node.edges.outgoing = Neo4jService.toArray(data, {r: 'rel', n: 'node'});
      });
      Neo4jService.getConnections(vm.node.id, false).then(function (data) {
        $log.debug('NOED', 'incoming', data);
        vm.node.edges.incoming = Neo4jService.toArray(data, {r: 'rel', n: 'node'});
      });
    });
  };

  vm.findNodes = function (filter) {
    var query = 'MATCH (n) WHERE n.name =~ {param} RETURN n LIMIT 8';
    return Neo4jService.query(query, {param: '(?i).*' + filter + '.*'}).then(function (data) {
      return Neo4jService.toArray(data);
    });
  };

  vm.nodeSelected = function ($item) {
    $log.debug('Node selected');
    vm.nodeId = $item.id;
    vm.findNode();
  };

})

.component('arrayEditor', {
  bindings: {
    items: '<',
    editor: '<'
  },
  transclude: true,
  templateUrl: 'node-editor/array-editor.html',
  controller: function ($scope) {
    var self = this;

    self.$onChanges = function (changes) {
      if (changes.items) {
        $scope.items = changes.items.currentValue;
      }
      if (changes.editor) {
        $scope.editor = changes.editor.currentValue;
      }
    };

    $scope.newItem = function () {
      $scope.items.push('new item');
    };

    $scope.deleteItem = function (index) {
      $scope.items.splice(index, 1);
    };
  }
})

.component('propertyEditor', {
  bindings: {
    ngModel: '=',
    editor: '='
  },
  templateUrl: 'node-editor/property-editor.html',
  controller: function ($scope) {
    var self = this;

    $scope.isArray = false;

    $scope.editor = 'text';

    $scope.editors = [
      'text',
      'textarea',
      'date',
      'datetime'
    ];

    self.$onInit = function () {
      $scope.$watch('self.ngModel', function () {
        $scope.value = self.ngModel;
        $scope.isArray = angular.isArray($scope.value);
      });
      $scope.editor = self.editor ? self.editor : 'text';
    };

    // self.$onChanges = function(changes) {
    //   if (changes.value) {
    //     console.log('PROP', changes.value);
    //     $scope.value = changes.value.currentValue;
    //     $scope.isArray = angular.isArray($scope.value);
    //   }
    // };
  }
})

.component('nodeEditor', {
  bindings: {
    node: '<',
    allowTypeChange: '@'
  },
  templateUrl: 'node-editor/node-editor.html',
  controller: function ($log, $scope, $filter) {
    
    var self = this;

    self.$onInit = function () {
      angular.forEach($scope.profiles, function (profile) {
        $scope.types = $scope.types.concat(profile.nodes.filter(function (type) {
          return $scope.types.indexOf(type) < 0;
        }));
      });
    };

    self.$onChanges = function (changes) {
      if (changes.node) {
        $scope.original = changes.node.currentValue;
        $scope.node = angular.copy($scope.original);
        if ($scope.original) {
          $log.debug('NOED', 'node', $scope.node);
          $scope.node.properties = [];
          var props = angular.copy($scope.original.properties);
          angular.forEach(props, function (value, key) {
            $scope.node.properties.push({name: key, value: value, editor: 'text', multi: angular.isArray(value), modified: false, deleted: false, original: true});
          });
          $scope.edges = $scope.original.edges;
        }
      }
    };

    $scope.original = null;

    $scope.item = null;

    $scope.profiles = [
      {
        name: 'Architecto',
        nodes: [
          'Architecto:Import',
          'Architecto:Profile'
        ],
        edges: [

        ],
        rules: [

        ]
      },
      {
        name: 'CMDB',
        nodes: [
          'Hardware',
          'Software'
        ]
      },
      {
        name: 'Databases',
        nodes: [
          'View',
          'Table'
        ]
      },
      {
        name: 'Data Lineage',
        nodes: [
          'DataSet',
          'DataProcess'
        ]
      }
    ];

    $scope.types = [];

    $scope.hideDeleted = false;

    $scope.revertType = function () {
      $scope.node.type = $scope.original.type;
    };

    $scope.newProperty = function () {
      var index = Object.keys($scope.node.properties).length;
      var name = '#property' + index;
      $scope.node.properties.push({name: name, value: name + ' value', editor: 'text', multi: false, modified: false, deleted: false, original: false});
    };

    $scope.deleteProperty = function (name) {
      var props = $filter('filter')($scope.node.properties, {name: name});
      if (props.length) {
        props[0].deleted = true;
      }
    };

    $scope.newIncomingRelationship = function () {

    };
  }
});
