(function () {
var UPLOADING_VIDEO_MESSAGE = 'Uploading video...';
var app = angular.module('wgWistiaUploader', []);

app.directive('wgWistiaUploader', [wgWistiaUploader]);

function wgWistiaUploader() {
	var directive = {
		link: link,
		controller: ['$scope', '$sce', controller],
		scope: {
			wistiaApiToken: '=',
			inputId: '='
		},
		templateUrl: 'wg-wistia-uploader.html',
		restrict: 'E'
	}

	return directive;
}

function link($scope, element, attrs, controller) {
	setTimeout(function () {
		$('#' + $scope.inputId).fileupload({
			dataType: 'json',
			formData: {
				api_password: $scope.wistiaApiToken
			},
			add: function(event, data) {
				controller.resetVideoUploadInfo();

				data.submit();
			},
			progressall: controller.updateProgress,
			done: controller.handleVideoUpload,
			error: controller.setUploadError
		});
	});
}

function controller($scope, $sce) {
	var self = this;

	this.resetVideoUploadInfo = function resetVideoUploadInfo(uploadStatus) {
		$scope.$apply(function () {
			$scope.uploadProgress = 0;
			$scope.videoId = '';
			$scope.videoUrl = '';
			$scope.uploadStatus = uploadStatus || UPLOADING_VIDEO_MESSAGE;
		});
	};

	this.updateProgress = function updateProgress(event, data) {
		if (data.total > 0) {
			$scope.$apply(function () {
				$scope.uploadProgress = Math.floor((data.loaded / data.total) * 100);
			});
		}
	};

	this.handleVideoUpload = function handleVideoUpload(event, data) {
		if (data.result.hashed_id) {
			$scope.$apply(function () {
				$scope.videoHeight = data.result.thumbnail.height;
				$scope.videoId = data.result.hashed_id;
				$scope.videoUrl = $sce.trustAsResourceUrl('http://fast.wistia.net/embed/iframe/' + $scope.videoId);
			});
		}
	};

	this.setUploadError = function setUploadError(response) {
		self.resetVideoUploadInfo(response.responseJSON.error);
	}
}

})();