'use strict';

/**
 * @ngdoc function
 * @name dprCalcApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the dprCalcApp
 */
var app = angular.module('dprCalcApp');

app.config(['ChartJsProvider', function(ChartJsProvider) {
    ChartJsProvider.setOptions({
        responsive: true
    });

    ChartJsProvider.setOptions('Line', {
        datasetFill: false
    });
}]);

app.filter('orderObjectBy', function() {
    return function(items, field, reverse) {
        return _.chain(_.keys(items))
            .map(function(item) {
                var i = items[item];
                i._objectKey = item;
                return i;
            })
            .sortBy(function(v) {
                return reverse ? -v[field] : v[field];
            })
            .value();
    };
});

app.service('levelDataService', [function() {
    return {
            '1': { 'ac': 12, 'wealth': 150 },
            '2': { 'ac': 14, 'wealth': 1000 },
            '3': { 'ac': 15, 'wealth': 3000 },
            '4': { 'ac': 17, 'wealth': 6000 },
            '5': { 'ac': 18, 'wealth': 10500 },
            '6': { 'ac': 19, 'wealth': 16000 },
            '7': { 'ac': 20, 'wealth': 23500 },
            '8': { 'ac': 21, 'wealth': 33000 },
            '9': { 'ac': 23, 'wealth': 46000 },
            '10': { 'ac': 24, 'wealth': 62000 },
            '11': { 'ac': 25, 'wealth': 82000 },
            '12': { 'ac': 27, 'wealth': 108000 },
            '13': { 'ac': 28, 'wealth': 140000 },
            '14': { 'ac': 29, 'wealth': 185000 },
            '15': { 'ac': 30, 'wealth': 240000 },
            '16': { 'ac': 31, 'wealth': 315000 },
            '17': { 'ac': 32, 'wealth': 410000 },
            '18': { 'ac': 33, 'wealth': 530000 },
            '19': { 'ac': 34, 'wealth': 685000 },
            '20': { 'ac': 36, 'wealth': 880000 }
        };
}]);

app.service('pointBuyService', function() {
    var pointBuy = {
        3: -4,
        4: -4,
        5: -4,
        6: -4,
        7: -4,
        8: -2,
        9: -1,
        10: 0,
        11: 1,
        12: 2,
        13: 3,
        14: 5,
        15: 7,
        16: 10,
        17: 13,
        18: 17
    };

    return function calculate(stats) {
        return _.reduce(stats, function(total, value) {
            value = value > 18 ? 18 : value;
            value = value < 7 ? 7 : value;
            return total + pointBuy[value];
        }, 0);
    };
});

app.service('editService', ['$rootScope', function($rootScope) {
    var edit = {
        id: null,
        value: null,
        target: null,
        source: null,
        dependentSources: null,
        dependentTargets: null,
        dependentValues: []
    };

    edit.set = function(id, source, target, dependentSources, dependentTargets) {
        edit.clear();

        edit.id = id;
        edit.source = source;
        edit.target = target;
        edit.value = source[target];
        edit.dependentSources = dependentSources;
        edit.dependentTargets = dependentTargets;
        edit.dependentValue = [];
        if(dependentSources && dependentTargets) {
            for(var d = 0; d < dependentSources.length && d < dependentTargets.length; d++) {
                var s = dependentSources[d];
                var t = dependentTargets[d];

                edit.dependentValues[d] = s[t];
            }
        }
    };
    edit.clear = function() {
        edit.id = null;

        if(edit.dependentSources && edit.value === edit.target[edit.source]) {
            for(var d = 0; d < edit.dependentSources.length && d < edit.dependentTargets.length && d < edit.dependentValues.length; d++) {
                var s = edit.dependentSources[d];
                var t = edit.dependentTargets[d];

                s[t] = edit.dependentValues[d];
            }
        }

        $rootScope.$broadcast('save');
    };
    edit.cancel = function() {
        edit.source[edit.tartet] = edit.value;
        edit.clear();
    };

    return edit;
}]);

app.service('abilityModService', function() {
    return function(score) {
        score = parseInt(score);
        return Math.floor((score - 10) / 2);
    };
});

app.service('abilityScoreService', function() {
    return ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
});

app.service('statService', ['bonusService', 'abilityModService', function(BONUS_TYPE, getAbilityMod) {
    function getValue(character, level, bonus) {
        var value;

        if(typeof bonus.type === 'string') {
            bonus.type = parseInt(bonus.type);
        }
        switch(bonus.type) {
            case BONUS_TYPE.STATIC: value = bonus.value; break;
            case BONUS_TYPE.DYNAMIC: value = bonus.value; break;
            case BONUS_TYPE.ABILITY:
                var score = getStat(character, level, bonus.value);
                value = getAbilityMod(score);
                break;
            case BONUS_TYPE.STAT: value = getStat(character, level, bonus.value); break;
            case BONUS_TYPE.BASE_ABILITY: value = character.data.abilityScores[bonus.value]; break;
            case BONUS_TYPE.DICE:
                 var dice = bonus.value.split('d');
                 value = (parseInt(dice[1]) / 2 + 0.5) * parseInt(dice[0]);
                 break;
            case BONUS_TYPE.POWER_ATTACK_HIT:
                var bab = getStat(character, level, 'bab');
                value = -1 * (Math.floor(bab / 4) + 1);
                break;
              case BONUS_TYPE.POWER_ATTACK_DMG:
                var bab2 = getStat(character, level, 'bab');
                bab2 = Math.floor(bab2 / 4) + 1;
                value = bonus.value ? bab2 * 3 : bab2 * 2;
                break;
              case BONUS_TYPE.TWO_WEAPON: value = -2; break;
          }

        if(typeof value === 'string') {
            value = parseFloat(value);
            value = isNaN(value) ? 0 : value;
        }

        if(bonus.modifier) {
            var modifier = bonus.modifier;
            if(typeof modifier === 'string') {
                modifier = level[modifier] || level.data[modifier];
            }
            value *= modifier;
            if(bonus.type !== BONUS_TYPE.DICE) {
                value = Math.floor(value);
            }
        }

        return value;
    }
    function levelFilter(level) {
        if(typeof level === 'string') {
            level = parseFloat(level);
            if(isNaN(level)) {
                return function() {
                    return false;
                };
            }
        }

        return function(lvl) {
            var l = parseFloat(lvl.name);
            return l <= level;
        };
    }
    function getFieldSum(character, level, field) {
        return function(result, value) {
            var name = value.name;
            value = value.data ? value.data : value;
            value.name = name;
            var v = _.reduce(value[field], function(res, val) {
                if(!val.applyOnce || value.name === level.name) {
                    return res + getValue(character, level, val);
                }
                return res;
            }, 0);
            return result += v ? v : 0;
        };
    }

    function getStat(character, level, stat) {
        var v = _.chain(character.data.levels)
            .filter(levelFilter(level.name))
            .reduce(getFieldSum(character, level, stat), 0)
            .value();
        return v;
    }

    function getStatMod(character, level, stat, mod) {
        return _.chain(character.data.levels)
          .filter(levelFilter(level.name))
          .map(function(level) {
              var obj = {};
              obj[stat] = {};
              obj[stat][mod] = level.data[stat][mod];
              return obj;
          })
          .reduce(getFieldSum(character, level, stat), 0)
          .value();
    }

    return {
        get: getStat,
        getMod: getStatMod,
        getValue: getValue
    };
}]);

app.service('bonusService', function() {
    var BONUS_TYPE = {
        STATIC: 0,
        ABILITY: 1,
        DYNAMIC: 2,
        STAT: 3,
        BASE_ABILITY: 4,
        DICE: 5,
        POWER_ATTACK_HIT: 6,
        POWER_ATTACK_DMG: 7,
        TWO_WEAPON: 8,
    };
    function text(id) {
        var value;
        switch(id) {
            case BONUS_TYPE.STATIC: value = 'Static'; break;
            case BONUS_TYPE.ABILITY: value = 'Ability'; break;
            case BONUS_TYPE.DYNAMIC: value = 'Dynamic'; break;
            case BONUS_TYPE.STAT: value = 'Stat'; break;
            case BONUS_TYPE.BASE_ABILITY: value = 'Base Ability'; break;
            case BONUS_TYPE.DICE: value = 'Dice'; break;
            case BONUS_TYPE.POWER_ATTACK_HIT: value = 'Power Attack'; break;
            case BONUS_TYPE.POWER_ATTACK_DMG: value = 'Power Attack'; break;
            case BONUS_TYPE.TWO_WEAPON: value = 'Two-weapon'; break;
        }
        return value;
    }
    function type(id) {
        var value;
        switch(id) {
            case BONUS_TYPE.STATIC: value = 'number'; break;
            case BONUS_TYPE.ABILITY: value = 'select'; break;
            case BONUS_TYPE.DYNAMIC: value = 'number'; break;
            case BONUS_TYPE.STAT: value = 'select'; break;
            case BONUS_TYPE.BASE_ABILITY: value = 'select'; break;
            case BONUS_TYPE.DICE: value = 'text'; break;
            case BONUS_TYPE.POWER_ATTACK_HIT: value = 'calc'; break;
            case BONUS_TYPE.POWER_ATTACK_DMG: value = 'checkbox'; break;
            case BONUS_TYPE.TWO_WEAPON: value = 'calc'; break;
        }
        return value;
    }

    BONUS_TYPE.text = text;
    BONUS_TYPE.type = type;

    return BONUS_TYPE;
});

app.service('renderService', function() {
    var RENDER_TYPE = {
        INLINE: 0,
        HEADER: 1,
        GROUP: 2
    };

    return RENDER_TYPE;
});

app.service('dprService', ['statService', 'levelDataService', function(stats, levelData) {
    var getValue = stats.getValue;

    function getHit(character, level, atk) {
        return _.reduce(atk.data.hitChance, function(total, chance) {
            return total += getValue(character, level, chance);
        }, 0);
    }
    function getDmg(character, level, atk, obj) {
        var damage = 0;
        var percision = 0;

        for(var d in atk.data.damage) {
            var dam = atk.data.damage[d];
            var dmg = getValue(character, level, dam);
            if(dam.percision) {
                percision += dmg;
            }
            else {
                damage += dmg;
            }
        }

        damage = damage < 0 ? 0 : damage;
        percision = percision < 0 ? 0 : percision;

        if(obj) {
            return { damage: damage, percision: percision };
        }

        if(percision) {
            return damage + ' and percision: ' + percision;
        }

        return damage;
    }
    function calculateAttackDPR(character, level, attack) {
        var lev = parseInt(level.name);
        var dat = levelData[lev];
        var targetAC = dat ? dat.ac : 0;
        var hitChance;
        var minHitChance = 0.05;
        var maxHitChance = 0.95;
        var damage = 0;
        var percision = 0;
        var hit = getHit(character, level, attack);

        var d = getDmg(character, level, attack, true);
        damage = d.damage;
        percision = d.percision;

        hitChance = 1 - ((targetAC-hit) / 20);
        hitChance = hitChance < minHitChance ? minHitChance : hitChance;
        hitChance = hitChance > maxHitChance ? maxHitChance : hitChance;

        // h(dp)+c(m-1)hd
        return hitChance * (damage + percision) + attack.data.critThreat * (attack.data.critMultiplier - 1) * hitChance * damage;
    }
    function calculateDPR(character, level, attackGroup) {
        return _.reduce(attackGroup.data.attacks, function(total, attack) {
            return total += calculateAttackDPR(character, level, attack);
        }, 0);
    }

    return {
        calculateAttackDPR: calculateAttackDPR,
        calculateDPR: calculateDPR,
        getHit: getHit,
        getDmg: getDmg
    };
}]);

app.factory('emptyCharacter', [function() {
    return function() {
        return {
            'levels': [],
            'race': 'Human',
            'class': '',
            'abilityScores': {
                'strength': 10,
                'dexterity': 10,
                'constitution': 10,
                'intelligence': 10,
                'wisdom': 10,
                'charisma': 10
            }
        };
    };
}]);

app.factory('emptyLevel', ['bonusService', function(BONUS_TYPE) {
    return function() {
        return {
        // Base items
        'name': 1,
        'attackGroups': [],
        // Ability information TODO: Move to standard stat
        // Standard stats
        // -- Ability Scores
        'strength': {
            'increase': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 1 },
            'class': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 2 },
            'enhance': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 3 },
            'base': { 'type': BONUS_TYPE.BASE_ABILITY, 'value': 'strength', 'applyOnce': true, 'order': 0 }
        },
        'dexterity': {
            'increase': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 1 },
            'class': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 2 },
            'enhance': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 3 },
            'base': { 'type': BONUS_TYPE.BASE_ABILITY, 'value': 'dexterity', 'applyOnce': true, 'order': 0 }
        },
        'constitution': {
            'increase': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 1 },
            'class': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 2 },
            'enhance': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 3 },
            'base': { 'type': BONUS_TYPE.BASE_ABILITY, 'value': 'constitution', 'applyOnce': true, 'order': 0 }
        },
        'intelligence': {
            'increase': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 1 },
            'class': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 2 },
            'enhance': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 3 },
            'base': { 'type': BONUS_TYPE.BASE_ABILITY, 'value': 'intelligence', 'applyOnce': true, 'order': 0 }
        },
        'wisdom': {
            'increase': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 1 },
            'class': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 2 },
            'enhance': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 3 },
            'base': { 'type': BONUS_TYPE.BASE_ABILITY, 'value': 'wisdom', 'applyOnce': true, 'order': 0 }
        },
        'charisma': {
            'increase': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 1 },
            'class': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 2 },
            'enhance': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 3 },
            'base': { 'type': BONUS_TYPE.BASE_ABILITY, 'value': 'charisma', 'applyOnce': true, 'order': 0 }
        },
        // -- End Ability Scores
        'ac': {
            'base': { 'type': BONUS_TYPE.STATIC, 'value': 10, 'flat-footed': true, 'touch': true, 'applyOnce': true, 'order': 0 },
            'armor': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'flat-footed': true, 'touch': false, 'applyOnce': true, 'order': 1 },
            'shield': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'flat-footed': true, 'touch': false, 'applyOnce': true, 'order': 2 },
            'dexterity': { 'type': BONUS_TYPE.ABILITY, 'value': 'dexterity', 'flat-footed': false, 'touch': true, 'title': 'Dex', 'applyOnce': true, 'order': 3 },
            'size': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'flat-footed': true, 'touch': true, 'applyOnce': true, 'order': 4 },
            'natural': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'flat-footed': true, 'touch': false, 'applyOnce': true, 'order': 5 },
            'deflection': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'flat-footed': true, 'touch': true, 'applyOnce': true, 'order': 6 },
            'dodge': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'flat-footed': false, 'touch': true, 'applyOnce': true, 'order': 7 },
            'touch': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'flat-footed': false, 'touch': true, 'applyOnce': true, 'order': 8 },
            'flat-footed': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'flat-footed': true, 'touch': false, 'applyOnce': true, 'order': 9 },
        },
        // -- Saves
        'fortitude': {
            'base': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 0 },
            'constitution': { 'type': BONUS_TYPE.ABILITY, 'value': 'constitution', 'applyOnce': true, 'title': 'Ability', 'order': 1 },
            'magic': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 2 },
            'misc': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 3 },
        },
        'reflex': {
            'base': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 0 },
            'dexterity': { 'type': BONUS_TYPE.ABILITY, 'value': 'dexterity', 'applyOnce': true, 'title': 'Ability', 'order': 1 },
            'magic': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 2 },
            'misc': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 3 },
        },
        'will': {
            'base': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 0 },
            'wisdom': { 'type': BONUS_TYPE.ABILITY, 'value': 'wisdom', 'applyOnce': true, 'title': 'Abililty', 'order': 1 },
            'magic': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 2 },
            'misc': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 3 },
        },
        // -- End Saves
        'dr': {
            'base': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 0 },
            'class': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 1 },
        },
        'sr': {
            'base': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 0 },
            'class': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 1 },
            'enhance': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 2 },
        },
        'hp': {
           'level': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 0 },
           'constitution': { 'type': BONUS_TYPE.ABILITY, 'value': 'constitution', 'title': 'Con', 'applyOnce': true, 'modifier': 'name', 'order': 1 },
           'favoured': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 2},
           'toughness': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 3 },
           'other': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 4 },
        },
        'bab': {
            'class': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 0 },
        },
        'initiative': {
            'dexterity': { 'type': BONUS_TYPE.ABILITY, 'value': 'dexterity', 'applyOnce': true, 'order': 0, 'title': 'Dex' },
            'class': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'order': 2 },
            'misc': { 'type': BONUS_TYPE.DYNAMIC, 'value': 0, 'applyOnce': true, 'order': 1 },
        },
        // Non-standard stats
        'movement': {
            'base': 30,
            'armor': 30,
            'fly': 0,
            'swim': 0,
            'climb': 0,
            'burrow': 0
        },
        'equipment': [],
        'feats': [],
        'skills': [],
        'spell-casting': [],
        'abilities': [],
    };
    };
}]);

app.factory('emptyAttackGroup', [function() {
    return function emptyAttackGroup() {
        return {
            'attacks': []
        };
    };
}]);

app.factory('emptyAttack', ['bonusService', function(BONUS_TYPE) {
    return function emptyAttack() {
        return {
          'weapon': 'attack',
          'damage': [
              { 'name': 'Weapon', 'type': BONUS_TYPE.DICE, 'value': '1d8', 'modifier': 1, 'percision': false },
              { 'name': '', 'type': BONUS_TYPE.ABILITY, 'value': 'strength', 'modifier': 1, 'percision': false }
          ],
          'hitChance': [
              { 'name': '', 'type': BONUS_TYPE.STAT, 'value': 'bab' },
              { 'name': '', 'type': BONUS_TYPE.ABILITY, 'value': 'strength' }
          ],
          'critThreat': 0.05,
          'critMultiplier': 2
        };
    };
}]);

app.factory('emptyHit', ['bonusService', function(BONUS_TYPE) {
    return function emptyHit() {
        return { 'name': 'hit', 'type': BONUS_TYPE.DYNAMIC, 'value': 0 };
    };
}]);

app.factory('emptyDamage', ['bonusService', function(BONUS_TYPE) {
    return function emptyDmg() {
        return { 'name': 'damage', 'type': BONUS_TYPE.DYNAMIC, 'value': '0', 'modifier': 1, 'percision': false };
    };
}]);

app.directive('autoFocus', [function() {
    return {
        restrict: 'A',
        link: function(scope, element) {
            element[0].focus();
        }
    };
}]);

app.directive('inputField', ['editService', function(edit) {
    return {
        restrict: 'E',
        templateUrl: 'views/input-field.html',
        transclude: true,
        scope: {
            cssClass: '=css',
            type: '=type',
            editId: '=id',
            editTarget: '=target',
            editSource: '=source',
            editName: '=namefunc',
            title: '=title',
            step: '=step',
            onChange: '=oncng',
            options: '=options',
            deleteFunc: '=delete',
            deleteIndex: '=delindex'
        },
        link: function(scope) {
            scope.edit = edit;
        }
    };
}]);

app.directive('inputAbility', ['editService', 'abilityModService', function(edit, abilityMod) {
    return {
        restrict: 'E',
        templateUrl: 'views/input-ability.html',
        transclude: true,
        scope: {
            scores: '=scores',
            target: '=source'
        },
        link: function(scope) {
            scope.edit = edit;
            scope.getAbilityMod = abilityMod;
        }
    };
}]);

app.directive('character', ['abilityScoreService', 'pointBuyService', 'emptyLevel', 'editService', function(abilityScores, pointBuy, empty, edit) {
    return {
        restrict: 'E',
        scope: {
            character: '=character',
        },
        templateUrl: 'views/character.html',
        controller: function($scope) {
            $scope.edit = edit;
            $scope.abilityScores = abilityScores;
            $scope.pointBuy = pointBuy;

            function setAllInactive() {
                angular.forEach($scope.character.data.levels, function(level) {
                   level.active = false;
                });
            }
            function addNewLevel() {
                var id = _.reduce($scope.character.data.levels, function(max, current) {
                    var cVal = parseInt(current.name);
                    return max > cVal ? max : cVal;
                }, 0);
                id++;
                $scope.character.data.levels.push({
                    id: id,
                    name: id,
                    active: true,
                    data: empty()
                });
            }

            $scope.remove = function remove(ind) {
                if($scope.character.data.levels.length === 1) {
                    return;
                }

                var active = $scope.character.data.levels[ind].active;

                if(active) {
                    setAllInactive();
                }

                $scope.character.data.levels.splice(ind, 1);

                if(active) {
                    if($scope.character.data.levels.length > ind) {
                        $scope.character.data.levels[ind].active = true;
                    }
                    else {
                        $scope.character.data.levels[ind - 1].active = true;
                    }
                }
            };

            $scope.add = function() {
                $scope.edit.clear();
                setAllInactive();
                addNewLevel();
            };

            $scope.sort = function() {
                var levels = $scope.character.data.levels;
                $scope.character.data.levels = _.sortBy(levels, function(level) {
                    return parseInt(level.name);
                });
            };

            $scope.download = function() {
                var data = btoa(angular.toJson($scope.character), false);
                window.open('data:application/json;base64,' + data);
            };
        }
    };
}]);

app.directive('level', [function() {
    return {
        restrict: 'E',
        scope: {
            level: '=level',
            character: '=character',
            sort: '=sort'
        },
        templateUrl: 'views/level.html',
        controller: function() {
        }
    };
}]);

app.directive('standardStats', ['editService', 'abilityModService', 'bonusService', 'renderService', 'statService', function(edit, abilityMod, BONUS_TYPE, RENDER_TYPE, stat) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            character: '=character',
            level: '=level'
        },
        templateUrl: 'views/standard-stats.html',
        link: function(scope) {
            scope.edit = edit;

            scope.standardStats = [
              { 'title': 'Ability', 'renderType': RENDER_TYPE.GROUP, 'items': [
                      { 'name': 'strength', 'title': 'Str' },
                      { 'name': 'dexterity', 'title': 'Dex' },
                      { 'name': 'constitution', 'title': 'Con' },
                      { 'name': 'intelligence', 'title': 'Int' },
                      { 'name': 'wisdom', 'title': 'Wis' },
                      { 'name': 'charisma', 'title': 'Cha' },
                  ],
                  'additionalColumns': [
                      { 'name': 'mod', 'title': 'Modifier', 'value': abilityMod, 'order': 0, 'position': 0 }
                  ]
              },
              { 'name': 'hp', 'title': 'HP', 'renderType': RENDER_TYPE.HEADER },
              { 'name': 'ac', 'title': 'AC', 'renderType': RENDER_TYPE.HEADER },
              { 'title': 'Saves', 'renderType': RENDER_TYPE.GROUP, 'items': [
                      { 'name': 'fortitude', 'title': 'Fort' },
                      { 'name': 'reflex', 'title': 'Ref' },
                      { 'name': 'will', 'title': 'Will' }
                  ],
              },
              { 'name': 'initiative', 'title': 'Init', 'renderType': RENDER_TYPE.INLINE },
              { 'name': 'bab', 'title': 'BAB', 'renderType': RENDER_TYPE.INLINE },
              { 'name': 'dr', 'title': 'DR', 'renderType': RENDER_TYPE.INLINE },
              { 'name': 'sr', 'title': 'SR', 'renderType': RENDER_TYPE.INLINE }
            ];

            scope.RENDER_TYPE = RENDER_TYPE;
            scope.BONUS_TYPE = BONUS_TYPE;
            scope.getStat = stat.get;
            scope.getStatMod = stat.getMod;
            scope.getValue = stat.getValue;
        }
    };
}]);

app.directive('standardStatInline', ['editService', 'abilityModService', 'bonusService', 'statService', function(edit, abilityMod, BONUS_TYPE, stat) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            character: '=character',
            level: '=level',
            stat: '=stat'
        },
        templateUrl: 'views/standard-stats/inline.html',
        link: function(scope) {
            scope.edit = edit;

            scope.BONUS_TYPE = BONUS_TYPE;
            scope.getStat = stat.get;
            scope.getStatMod = stat.getMod;
            scope.getValue = stat.getValue;
        }
    };
}]);

app.directive('standardStatHeader', ['editService', 'abilityModService', 'bonusService', 'statService', function(edit, abilityMod, BONUS_TYPE, stat) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            character: '=character',
            level: '=level',
            stat: '=stat'
        },
        templateUrl: 'views/standard-stats/header.html',
        link: function(scope) {
            scope.edit = edit;

            scope.BONUS_TYPE = BONUS_TYPE;
            scope.getStat = stat.get;
            scope.getStatMod = stat.getMod;
            scope.getValue = stat.getValue;
        }
    };
}]);

app.directive('standardStatGroup', ['editService', 'abilityModService', 'bonusService', 'statService', function(edit, abilityMod, BONUS_TYPE, stat) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            character: '=character',
            level: '=level',
            stat: '=stat'
        },
        templateUrl: 'views/standard-stats/group.html',
        link: function(scope) {
            scope.edit = edit;

            scope.BONUS_TYPE = BONUS_TYPE;
            scope.getStat = stat.get;
            scope.getStatMod = stat.getMod;
            scope.getValue = stat.getValue;
        }
    };
}]);

app.directive('attackGroups', ['editService', 'emptyAttackGroup', function(edit, empty) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            character: '=character',
            level: '=level'
        },
        templateUrl: 'views/attack-group-list.html',
        controller: function($scope) {
            var id = 0;
            $scope.edit = edit;

            function getActive() {
                return _.find($scope.level.data.attackGroups, function(group) {
                    return group.active;
                });
            }
            function setAllInactive() {
                angular.forEach($scope.level.data.attackGroups, function(group) {
                   group.active = false;
                });
            }
            function addAttackGroup(group) {
                $scope.level.data.attackGroups.push(group);
            }
            function addNewAttackGroup() {
                id++;
                addAttackGroup({
                    id: id,
                    name: 'attack group ' + id,
                    active: true,
                    data: empty()
                });
            }
            function addCopyAttackGroup(group, addCopy) {
                id++;
                group = angular.copy(group);
                if(addCopy) {
                    group.name = group.name + ' copy';
                }
                group.id = id;
                group.active = true;
                addAttackGroup(group);
            }

            $scope.remove = function remove(ind) {
                if($scope.level.data.attackGroups.length > 1) {
                    $scope.level.data.attackGroups.splice(ind, 1);
                }
            };
            $scope.add = function() {
                $scope.edit.clear();
                setAllInactive();
                addNewAttackGroup();
            };
            $scope.copy = function() {
                $scope.edit.clear();
                var active = getActive();
                setAllInactive();
                addCopyAttackGroup(active, true);
            };
            $scope.copyPreviousLevel = function() {
                var levelName = parseInt($scope.level.name);
                var level = _.reduce($scope.character.data.levels, function(max, lev) {
                    var name = parseInt(lev.name);
                    return name < levelName && (max === null || parseInt(max.name) < name) ? lev : max;
                }, null);
                if(level === null) {
                    return;
                }
                $scope.edit.clear();
                setAllInactive();
                while($scope.level.data.attackGroups.length > 0) {
                    $scope.level.data.attackGroups.splice(0, 1);
                }
                for(var g in level.data.attackGroups) {
                    var group = level.data.attackGroups[g];
                    addCopyAttackGroup(group);
                    setAllInactive();
                }
                $scope.level.data.attackGroups[0].active = true;
            };
        }
    };
}]);

app.directive('attackGroup', ['editService', 'dprService', 'emptyAttack', function(edit, dpr, empty) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            character: '=character',
            level: '=level',
            group: '=group'
        },
        templateUrl: 'views/attack-group.html',
        controller: function($scope) {
            var id = 0;
            $scope.edit = edit;
            $scope.dpr = dpr.calculateDPR;

            function getActive() {
                return _.find($scope.group.data.attacks, function(attack) {
                    return attack.active;
                });
            }
            function setAllInactive() {
                angular.forEach($scope.group.data.attacks, function(attack) {
                   attack.active = false;
                });
            }
            function addAttack(atk) {
                $scope.group.data.attacks.push(atk);
            }
            function addNewAttack() {
                id++;
                addAttack({
                    id: id,
                    name: 'attack ' + id,
                    active: true,
                    data: empty()
                });
            }
            function addCopyAttack(atk) {
                id++;
                atk = angular.copy(atk);
                atk.name = atk.name + ' copy';
                atk.id = id;
                atk.active = true;
                addAttack(atk);
            }

            $scope.remove = function remove(ind) {
                if($scope.group.data.attacks.length > 1) {
                    $scope.group.data.attacks.splice(ind, 1);
                }
            };
            $scope.add = function() {
                $scope.edit.clear();
                setAllInactive();
                addNewAttack();
            };
            $scope.copy = function() {
                $scope.edit.clear();
                var active = getActive();
                setAllInactive();
                addCopyAttack(active);
            };
        }
    };
}]);

app.directive('attack', ['editService', 'emptyHit', 'emptyDamage', 'bonusService', 'dprService', 'abilityScoreService', function(edit, emptyHit, emptyDamage, BONUS_TYPE, dpr, abilities) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            character: '=character',
            level: '=level',
            group: '=group',
            attack: '=attack'
        },
        templateUrl: 'views/attack.html',
        controller: function($scope) {
            $scope.edit = edit;
            $scope.dpr = dpr;
            $scope.hitChance = {
                add: function() {
                    $scope.edit.clear();
                    $scope.attack.data.hitChance.push(emptyHit());
                },
                remove: function(ind) {
                    $scope.edit.clear();
                    $scope.attack.data.hitChance.splice(ind, 1);
                },
                types: [
                    BONUS_TYPE.ABILITY,
                    BONUS_TYPE.DYNAMIC,
                    BONUS_TYPE.POWER_ATTACK_HIT,
                    BONUS_TYPE.STAT,
                    BONUS_TYPE.TWO_WEAPON
                ]
            };
            $scope.damage = {
                add: function() {
                    $scope.edit.clear();
                    $scope.attack.data.damage.push(emptyDamage());
                },
                remove: function(ind) {
                    $scope.edit.clear();
                    $scope.attack.data.damage.splice(ind, 1);
                },
                types: [
                    BONUS_TYPE.ABILITY,
                    BONUS_TYPE.DICE,
                    BONUS_TYPE.DYNAMIC,
                    BONUS_TYPE.POWER_ATTACK_DMG,
                ]
            };

            function buildType(type) {
                return { value: type, name: BONUS_TYPE.text(type) };
            }

            $scope.hitChance.types = _.map($scope.hitChance.types, buildType);
            $scope.damage.types = _.map($scope.damage.types, buildType);

            var abilityOptions = abilities;
            var statOptions = ['bab'];

            $scope.getOptions = function(type) {
                type = parseInt(type);
                var options;
                switch(type) {
                    case BONUS_TYPE.ABILITY: options = abilityOptions; break;
                    case BONUS_TYPE.STAT: options = statOptions; break;
                    default: options = null; break;
                }

                return options;
            };
            $scope.getTitle = function(type) {
                type = parseInt(type);
                var title;
                switch(type) {
                    case BONUS_TYPE.POWER_ATTACK_DMG: title = 'Two-handed:'; break;
                    default: title = ''; break;
                }

                return title;
            };

            $scope.BONUS_TYPE = BONUS_TYPE;
            $scope.bonusText = BONUS_TYPE.text;
            $scope.bonusType = BONUS_TYPE.type;
        }
    };
}]);

app.directive('attackInput', ['bonusService', 'statService', function(BONUS_TYPE, stat) {
    return {
        restrict: 'E',
        transclude: false,
        scope: {
            character: '=character',
            level: '=level',
            group: '=group',
            attack: '=attack',
            source: '=source',
            index: '=index',
            name: '=name',
            options: '=options',
            title: '=title'
        },
        templateUrl: 'views/attack-input.html',
        controller: function($scope) {
            $scope.BONUS_TYPE = BONUS_TYPE;
            $scope.bonusText = BONUS_TYPE.text;
            $scope.bonusType = BONUS_TYPE.type;

            $scope.calcType = function(type) {
                return BONUS_TYPE.type(type) === 'calc';
            };
            $scope.calcValue = stat.getValue;

            $scope.selectType = function(type) {
                return BONUS_TYPE.type(type) === 'select';
            };
            $scope.textType = function(type) {
                return BONUS_TYPE.type(type) === 'text';
            };
            $scope.numberType = function(type) {
                return BONUS_TYPE.type(type) === 'number';
            };
            $scope.checkboxType = function(type) {
                return BONUS_TYPE.type(type) === 'checkbox';
            };
        }
    };
}]);

app.directive('graph', ['dprService', '$timeout', 'statService', function(dprService, $timeout, statService) {
    return {
        restrict: 'E',
        transclude: false,
        scope: {
            characters: '=characters',
        },
        templateUrl: 'views/graph.html',
        controller: function($scope) {
            $scope.levels = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
            $scope.data = [];
            $scope.series = [];
            $scope.type = 'level';
            $scope.types = [
                { value: 'dpr', name: 'DPR' },
                { value: 'level', name: 'Level' }
            ];

            $scope.charts = {
                dpr: {
                    data: [],
                    series: [],
                    labels: $scope.levels
                },
                level: {
                    data: [],
                    series: [],
                    labels: [ 'ac', 'dpr', 'fortitude', 'reflex', 'will', 'hp', 'initiative', 'dr', 'sr' ],
                    level: 1
                },
            };
        },
        link: function(scope) {
            function characterFilter(character) {
                if(character.graph === undefined) {
                    character.graph = true;
                }
                return character.graph;
            }

            function levelDpr(character, level) {
                var lev = _.find(character.data.levels, function(l) { return parseInt(l.name) === parseInt(level); });
                if(lev) {
                    return _.reduce(lev.data.attackGroups, function(max, group) {
                        var dpr = dprService.calculateDPR(character, lev, group);
                        return max > dpr ? max : dpr;
                      }, 0);
                }
                else {
                    return 0;
                }
            }

            function data(type) {
                function mapChar(character) {
                    return _.map(scope.levels, function(level) {
                        return levelDpr(character, level);
                    });
                }

                function mapLevelChar(level) {
                    return function(character) {
                        var lev = _.find(character.data.levels, function(l) { return parseInt(l.name) === parseInt(level); });

                        return _.map(scope.charts.level.labels, function(item) {
                                var characterMax = _.max(scope.characters, function(char) {
                                    var lvl = _.find(character.data.levels, function(lvl) {
                                        return parseInt(level) === parseInt(lvl.name);
                                    });

                                    if(!level) {
                                        return 0;
                                    }

                                    if(item === 'dpr') {
                                        return levelDpr(char, lvl.name);
                                    }

                                    return statService.get(char, lvl, item);
                                });

                                var maxLevel = _.find(characterMax.data.levels, function(lvl) {
                                    return parseInt(level) === parseInt(lvl.name);
                                });

                                var max = item === 'dpr' ? levelDpr(characterMax, maxLevel.name) : statService.get(characterMax, maxLevel, item);

                                if(max === 0) {
                                    return 0;
                                }

                                if(item === 'dpr') {
                                    return levelDpr(character, level) / max;
                                }

                                return statService.get(character, lev, item) / max;
                            });
                    };
                }

                switch(type) {
                    case 'dpr':
                        return _.chain(scope.characters)
                            .filter(characterFilter)
                            .map(mapChar)
                            .value();
                    case 'level':
                        return _.chain(scope.characters)
                            .filter(characterFilter)
                            .map(mapLevelChar(scope.charts.level.level))
                            .value();
                    default: return [];
                }
            }
            function series(type) {
                switch(type) {
                    case 'dpr':
                    case 'level':
                        return _.chain(scope.characters)
                        .filter(characterFilter)
                        .map('name')
                        .value();
                    default: return [];
                }
            }
            function updateType(type) {
                scope.charts[type].data = data(type);
                scope.charts[type].series = series(type);
            }
            function update() {
                updateType('dpr');
                updateType('level');
            }

            function updateTimeout() {
                $timeout(update, 100);
            }

            scope.$on('show-graph', updateTimeout);

            scope.update = update;
        }
    };
}]);

app.directive('equipment', ['editService', 'levelDataService', 'statService', function(edit, levelData, stat) {
    return {
        restrict: 'E',
        transclude: false,
        scope: {
            character: '=character',
            level: '=level'
        },
        templateUrl: 'views/equipment.html',
        controller: function($scope) {
            $scope.edit = edit;

            function emptyItem() {
                return {
                    'name': 'item name',
                    'weight': 0,
                    'value': 0,
                };
            }
            var caps = {
                11: 115,
                12: 130,
                13: 150,
                14: 175,
                15: 200,
                16: 230,
                17: 260,
                18: 300,
                19: 350,
            };
            function capacity(strength) {
                if(strength < 11) {
                    return strength * 10;
                }
                else if(caps[strength]) {
                    return caps[strength];
                }
                else {
                    var val = capacity(strength - 10) * 4;
                    caps[strength] = val;
                    return val;
                }
            }

            $scope.add = function() {
                $scope.level.data.equipment.push(emptyItem());
            };
            $scope.remove = function(ind) {
                $scope.level.data.equipment.splice(ind, 1);
            };
            $scope.copyPreviousLevel = function() {
                var levelName = parseInt($scope.level.name);
                var level = _.reduce($scope.character.data.levels, function(max, lev) {
                    var name = parseInt(lev.name);
                    return name < levelName && (max === null || parseInt(max.name) < name) ? lev : max;
                }, null);
                if(level === null) {
                    return;
                }
                $scope.edit.clear();
                $scope.level.data.equipment = angular.copy(level.data.equipment);
            };
            $scope.total = function(type) {
                return _.reduce($scope.level.data.equipment, function(total, item) {
                    return total += item[type];
                }, 0);
            };

            $scope.wealthByLevel = function(level) {
                var data = levelData[level];
                if(!data) {
                    return 0;
                }
                return data.wealth;
            };
            $scope.carryCapacity = {
                light: function(strength) {
                    strength = parseInt(strength);
                    return Math.floor(capacity(strength) / 3);
                },
                medium: function(strength) {
                    strength = parseInt(strength);
                    return Math.floor(capacity(strength) / 3) * 2;
                },
                heavy: function(strength) {
                    strength = parseInt(strength);
                    return capacity(strength);
                }
            };

            $scope.getStat = stat.get;
        }
    };
}]);

app.directive('feat', ['editService', function(edit) {
    return {
        restrict: 'E',
        transclude: false,
        scope: {
            character: '=character',
            level: '=level'
        },
        templateUrl: 'views/feat.html',
        controller: function($scope) {
            $scope.edit = edit;

            function emptyFeat() {
                return {
                    'name': 'feat',
                    'type': 'general',
                    'description': 'description'
                };
            }

            $scope.add = function() {
                $scope.level.data.feats.push(emptyFeat());
            };
            $scope.remove = function(ind) {
                $scope.level.data.feats.splice(ind, 1);
            };
            $scope.feats = [];
        },
        link: function(scope) {

            function setFeats() {
                var lev = parseInt(scope.level.name);
                scope.feats = _.reduce(scope.character.data.levels, function(feats, level) {
                    if(parseInt(level.name) < lev) {
                        return feats.concat(_.map(level.data.feats, function(feat) {
                            feat.level = level.name;
                            return feat;
                        }));
                    }
                    return feats;
                }, []);
            }

            setFeats();

            scope.$watch('level.name', setFeats);
        }
    };
}]);

app.controller('CharacterController', ['$scope', 'emptyCharacter', 'editService', '$cookies', function($scope, empty, edit, $cookies) {
    function makeCookies(name, value) {
        function writeCookie(name, value, target) {
            if(target === undefined || target === null) {
                target = $cookies;
            }

            if(_.isArray(value) || _.isObject(value)) {
                var items = [];
                items.push(_.isArray(value) ? 'array' : 'object');
                for(var i in value) {
                    items.push(i);
                    writeCookie(name + '-' + i, value[i], target[i]);
                }
                target[name] = items;
            }
            else if(_.isNumber(value) || _.isString(value) || _.isBoolean(value) || _.isDate(value)) {
                target[name] = value;
            }
            else if(_.isFunction(value)) {
                throw 'Cannot save function as a cookie';
            }
            else {
                throw 'Cookie data type not not handled';
            }
        }

        var copy = angular.copy(value);
        writeCookie(name, copy);
    }

    function loadCookies(base) {
        function readCookie(name) {
            var cookie = $cookies[name];

            if(_.isArray(cookie)) {
                switch(cookie[0]) {
                    case 'array':
                        var array = [];
                        for(var i = 1; i < cookie.length; i++) {
                            array.push(readCookie(name + '-' + cookie[i]));
                        }
                        return array;
                    case 'object':
                        var obj = {};
                        for(var c = 1; i < cookie.length; i++) {
                            obj[cookie[c]] = readCookie(name + '-' + cookie[c]);
                        }
                        return obj;
                    default:
                        throw 'Cookie load type not found';
                }
            }

            return cookie;
        }

        return readCookie(base);
    }

    var id = 0;
    $scope.edit = edit;

    $scope.characters = loadCookies('characters') || [];

    function getActive() {
        return _.find($scope.characters, function(character) {
            return character.active;
        });
    }
    function setAllInactive() {
        angular.forEach($scope.characters, function(character) {
           character.active = false;
        });
    }
    function addCharacter(character) {
        $scope.characters.push(character);
    }
    function addNewCharacter() {
        id++;
        addCharacter({
            id: id,
            name: 'character ' + id,
            active: true,
            data: empty()
        });
    }
    function addCopyCharacter(character) {
        id++;
        character = angular.copy(character);
        character.name = character.name + ' copy';
        character.id = id;
        character.active = true;
        addCharacter(character);
    }

    $scope.remove = function remove(ind) {
        if($scope.characters.length > 1) {
            $scope.characters.splice(ind, 1);
        }
    };
    $scope.add = function() {
        $scope.edit.clear();
        setAllInactive();
        addNewCharacter();
    };
    $scope.copy = function() {
        $scope.edit.clear();
        var active = getActive();
        if(!active) {
            return;
        }
        setAllInactive();
        addCopyCharacter(active);
    };

    $scope.graph = true;
    $scope.toggleGraph = function() {
        edit.clear();
        $scope.graph = !$scope.graph;
        if($scope.graph) {
            $scope.$broadcast('show-graph');
        }
    };

    if($scope.characters.length === 0) {
        $scope.add();
    }

    $scope.uploadActive = false;
    $scope.upload = function() {
        $scope.edit.clear();
        setAllInactive();

        var el = angular.element('#file')[0];
        var f = el.files[0];
        var r = new FileReader();

        r.onload = function(e) {
            var character = angular.fromJson(e.target.result);
            character.active = true;
            addCharacter(character);
            $scope.uploadActive = false;
            $scope.$apply();
        };

        r.readAsBinaryString(f);
    };

    $scope.$on('save', function() {
        makeCookies('characters', $scope.characters);
    });
}]);

