angular.module('app')

.controller('importManagerController', function ($log, Neo4jService) {

  var vm = this;

  vm.imports = [];

  Neo4jService.getNodesByLabel('Architecto:Import').then(function (data) {
    vm.imports = Neo4jService.toArray(data);
  });

  vm.selectImport = function (item) {
    vm.import = item;
  };

})

.component('importManager', {
  bindings: {
    import: '<'
  },
  templateUrl: 'import-manager/import-manager.html',
  controller: function ($log, $scope, Neo4jService) {

    var self = this;

    $scope.running = false;

    self.$onInit = function () {
    };

    self.$onChanges = function (changes) {
      if (changes.import) {
        $scope.import = changes.import.currentValue;
        self.clearProgress();
      }
    };

    self.clearProgress = function () {
      $scope.progress = {
        nodes: [],
        edges: []
      };
      if($scope.import) {
        for(var i = 0; i < $scope.import.properties.nodes.length; i++) {
          $scope.progress.nodes.push(null);
        }
        for(var i = 0; i < $scope.import.properties.edges.length; i++) {
          $scope.progress.edges.push(null);
        }
      }
    }

    $scope.run = function () {
      self.clearProgress();
      $scope.cancelled = false;
      $scope.running = true;
      Neo4jService.getNode($scope.import.id)
        .then(function (data) {
          var imp = Neo4jService.toObject(data);
          for(var i = 0; i < imp.properties.nodes.length; i++) {
            if($scope.cancelled) return;
            $log.debug('CYPHER', imp.properties.nodes[i]);
            $scope.progress.nodes[i] = 'warning';
            Neo4jService.query(imp.properties.nodes[i])
              .then(function (data) {
                $scope.progress.nodes[i] = 'success';
              }, function (err) {
                $scope.progress.nodes[i] = 'danger';
                $scope.cancelled = true;
              });
          };
          $scope.running = false;
        }, function (err) {
          self.showRunProgress(i, err);
          $scope.running = false;
        });
    };

  }
})
