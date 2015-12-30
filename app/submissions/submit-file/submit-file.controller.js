(function () {
  'use strict';

  angular.module('tc.submissions').controller('SubmitFileController', SubmitFileController);

  SubmitFileController.$inject = ['$stateParams', 'UserService', 'SubmissionsService'];

  function SubmitFileController($stateParams, UserService, SubmissionsService) {
    var vm = this;

    vm.fontList1 = [
      { label: 'Studio Standard Fonts List', value: 'STUDIO_STANDARDS_FONTS_LIST', id: 1 },
      { label: 'Fonts.com', value: 'FONTS_DOT_COM', id: 1  },
      { label: 'MyFonts', value: 'MYFONTS', id: 1  },
      { label: 'Adobe Fonts', value: 'ADOBE_FONTS', id: 1  },
      { label: 'Font Shop', value: 'FONT_SHOP', id: 1  },
      { label: 'T.26 Digital Type Foundry', value: 'T26_DIGITAL_TYPE_FOUNDRY', id: 1  },
      { label: 'Font Squirrel', value: 'FONT_SQUIRREL', id: 1  },
      { label: 'Typography.com', value: 'TYPOGRAPHY_DOT_COM', id: 1 }
    ];

    var files = {};
    vm.comments = '';
    vm.submissionForm = {
      files: [],

      // Should the rank input field be set to 1 automatically?
      submitterRank: 1,
      submitterComments: '',
      fonts: [{
        id: 1,
        source: '',
        name: '',
        sourceUrl: ''
      }],
      stockArts: [{
        id: 1,
        description: '',
        sourceUrl: '',
        fileNumber: ''
      }],
      hasAgreedToTerms: false
    };

    var userId = parseInt(UserService.getUserIdentity().userId);

    vm.submissionsBody = {
      reference: {

        // type dynamic or static?
        type: 'CHALLENGE',
        id: $stateParams.challengeId,

        // Current phase check should come from challenge API?
        phase: 'SUBMISSION'

      },
      userId: userId,
      data: {

        // Dynamic or static?
        method: 'DESIGN_CHALLENGE_ZIP_FILE',
        files: [],
        submitterRank: 1,
        submitterComments: '',
        fonts: [],
        stockArts: []
      }
    };

    vm.setFileReference = setFileReference;
    vm.uploadSubmission = uploadSubmission;
    vm.selectFont = selectFont;
    vm.createAnotherFontFieldset = createAnotherFontFieldset;
    vm.createAnotherStockArtFieldset = createAnotherStockArtFieldset;

    activate();

    function activate() {}

    function setFileReference(file, fieldId) {
      files[fieldId] = file;

      var fileObject = {
        name: file.name,
        type: fieldId,
        status: 'PENDING'
      };

      switch(fieldId) {
        case 'SUBMISSION_ZIP':
          fileObject.mediaType = 'application/octet-stream';
          break;
        case 'SOURCE_ZIP':
          fileObject.mediaType = 'application/octet-stream';
          break;
        default:
          fileObject.mediaType = file.type;
      }



      // If user picks a new file, replace the that file's fileObject with a new one
      // Or add it the list if it's not there
      if (vm.submissionsBody.data.files.length) {
        vm.submissionsBody.data.files.some(function(file, i, filesArray) {
          if (file.type === fileObject.type) {
            file = fileObject;
          } else if (filesArray.length === i + 1) {
            filesArray.push(fileObject);
          }
        });
      } else {
        vm.submissionsBody.data.files.push(fileObject);
      }
    }

    function selectFont(newFont) {
      console.log('new value: ', newFont);
      var id = newFont.id - 1;
      vm.submissionForm.fonts[id].source = newFont.value;
    }

    function createAnotherFontFieldset() {
      var id = vm.submissionForm.fonts.length;
      var newFontList = vm['fontList' + (id + 1)] = angular.copy(vm['fontList' + id]);

      newFontList.forEach(function(font) {
        font.id++;
      });

      vm.submissionForm.fonts.push({
        id: vm.submissionForm.fonts.length + 1,
        source: '',
        name: '',
        sourceUrl: ''
      });
    }

    function createAnotherStockArtFieldset() {
      vm.submissionForm.stockArts.push({
        id: vm.submissionForm.stockArts.length + 1,
        description: '',
        sourceUrl: '',
        fileNumber: ''
      });
    }

    function uploadSubmission() {
      vm.submissionsBody.data.submitterComments = vm.comments;
      vm.submissionsBody.data.submitterRank = vm.submissionForm.submitterRank;

      var stockArts = angular.copy(vm.submissionForm.stockArts);
      vm.submissionsBody.data.stockArts = stockArts.map(function(stockArt) {
        delete stockArt.id;
        return stockArt;
      });

      var fonts = angular.copy(vm.submissionForm.fonts);
      vm.submissionsBody.data.fonts = fonts.map(function(font) {
        if (font.source) {
          delete font.id;
          return font;
        }
      });

      SubmissionsService.getPresignedURL(vm.submissionsBody, files);
    }
  }
})();
