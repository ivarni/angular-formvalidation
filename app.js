angular.module('app', [])
.controller('Ctrl', ['$scope', 'numberModelFactory', function($scope, numberModelFactory) {

    $scope.models = {};

    $scope.models.number1 = numberModelFactory.create({
        value: 1,
        max: 10
    });

    $scope.models.number2 = numberModelFactory.create({
        min: 5
    });

    $scope.submit = function() {
        $scope.$broadcast('validate');
        if ($scope.form.$valid) {
            $scope.message = 'Everything OK'
        } else {
            $scope.message = 'Form has errors'
        }
    }

}])
.service('numberModelFactory', ['validators', function(validators) {

    var NumberModel = function(config) {
        this.value = config.value;
        this.validate = validators.numberValidator(
            config.min,
            config.max
        );
    };

    this.create = function(config) {
        config = config || {};
        return new NumberModel(config);
    };

}])
.service('validators', [function() {

    this.numberValidator = function(min, max) {
        return function numberValidator(value) {
            var numVal = parseInt(value, 10);
            if (isNaN(numVal)) {
                return "Not a number";
            } else if (numVal > max) {
                return "Number too big, max size " + max;
            } else if (numVal < min) {
                return "Number too small, min size " + min;
            }
            return null;
        }
    }

}])
.directive('validate', [function() {

    return {
        restrict: 'A',
        require: '^ngModel',
        scope: {
            model: '=validate'
        },
        link: function(scope, element, attrs, ngModelController) {

            var errorBox = angular.element('<div>').addClass('error');
            var showErrors = false;

            scope.$on('validate', function() {
                showErrors = true;
                validate(scope.model.value);
            });

            element.on('blur', function() {
                showErrors = true;
                ngModelController.$setViewValue(ngModelController.$viewValue);
            });

            function validate(value) {
                var errorMessage = scope.model.validate(value);
                if (errorMessage) {
                    ngModelController.$setValidity(attrs.name, false);
                    if (showErrors) {
                        displayError(errorMessage);
                    }
                } else {
                    ngModelController.$setValidity(attrs.name, true);
                    removeError();
                    return value;
                }
            }

            function displayError(message) {
                errorBox.html(message);
                element.after(errorBox);
            }

            function removeError() {
                errorBox.remove();
            }

            ngModelController.$formatters.unshift(validate);
            ngModelController.$parsers.unshift(validate);
        }
    }

}]);




