function neo4jResultToArray (records, mapping) {

  function getValue (fields) {
    var obj = {
      id: fields.identity.low,
      type: fields.type ? fields.type : (fields.labels.length > 1 ? fields.labels : fields.labels[0]),
      properties: fields.properties,
    };
    if(fields.start) {
      obj.start = fields.start.low;
    }
    if(fields.end) {
      obj.end = fields.end.low;
    }
    return obj;
  };

  var data = [];
  records.forEach(function (record) {
    var obj = {};
    if(mapping) {
      for(var key in mapping) {
        if (!mapping.hasOwnProperty(key)) continue;
        obj[mapping[key]] = getValue(record._fields[record._fieldLookup[key]]);
      }
    } else {
      obj = getValue(record._fields[0]);
    }
    data.push(obj);
  });

  return data;

}

function neo4jResultToObject (records) {
  var obj = this.toArray(records)[0];
  return obj;
}

'use strict';

(function () {

angular.module('org.74labs.neo4j', [])

  .factory('Neo4jService', function ($log, $window, $q) {

    var driver = $window.neo4j.v1.driver("bolt://localhost:7687", $window.neo4j.v1.auth.basic('neo4j', 'admin')); // { scheme: 'none' }
    var session = driver.session();

    return {

      getNode: function (id) {
        return this.query('MATCH (n) WHERE ID(n) = toInt({id}) RETURN n', {
          id: id
        });
      },

      getAllPropertyValues: function (property) {
        return this.query('MATCH (n) RETURN DISTINCT n[{property}] AS value', {
          property: property
        });
      },

      getNodesByProperty: function (property, value) {
        return this.query('MATCH (n) WHERE n[{property}] = {value} RETURN n', {
          property: property,
          value: value
        });
      },

      getConnections: function (id, outgoing) {
        if(outgoing) {
          return this.query('MATCH (src)-[r]->(n) WHERE ID(src) = toInteger({id}) RETURN r, n', {
            id: id
          });
        } else {
          return this.query('MATCH (src)<-[r]-(n) WHERE ID(src) = toInteger({id}) RETURN r, n', {
            id: id
          });
        }
      },

      getConnectedNodes: function (id) {
        return this.query('MATCH (n)-[r]-(m) WHERE ID(n) = toInteger({id}) RETURN m', {
          id: id
        });
      },

      getConnectedNodesByLabel: function (id, label) {
        return this.query('MATCH (n)-[]-(m) WHERE ID(n) = toInteger({id}) AND {label} = labels(m) RETURN m', {
          id: id,
          label: label
        });
      },

      getNodesByLabel: function (label) {
        return this.query('MATCH (n) WHERE {label} IN labels(n) RETURN n', {
          label: label
        });
      },

      getNodeGraph: function (id) {
        return this.query('MATCH (n) WHERE ID(n) = toInteger({id}) RETURN n', {
          id: id
        });
      },

      query: function (cypher, params) {
        var deferred = $q.defer();
        session.run(cypher, params)
          .then(function (result) {
            deferred.resolve(result.records);
          })
          .catch(function (error) {
            $log.error(error);
            deferred.reject(error);
          });
        return deferred.promise;
      },

      toArray: neo4jResultToArray,

      toObject: neo4jResultToObject

    }
  });

})();
