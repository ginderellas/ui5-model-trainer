sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text"
], function (Controller, formatter, JSONModel, Dialog, Button, ButtonType, Text) {
	"use strict";

	return Controller.extend("sap.ui.demo.basicTemplate.controller.App", {

		formatter: formatter,

		onInit: function () {
			this._resetView();
		},

		resetModel: function () {
			let oModel = new JSONModel({
				Busy: false,
				Path: "",
				ThrowFactors: [{
						Id: "1",
						Name: "1x"
					},
					{
						Id: "2",
						Name: "2x"
					},
					{
						Id: "3",
						Name: "3x"
					}
				],
				Input: [{
						Factor: "1",
						Amount: ""
					},
					{
						Factor: "1",
						Amount: ""
					},
					{
						Factor: "1",
						Amount: ""
					}
				]
			});

			this.getView().setModel(oModel);
		},

		onAmountChange: function (oEvent) {
			let oSource = oEvent.getSource();
			let sValue = oSource.getValue();
			let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

			if (Number(sValue) < 0) {
				oSource.setValueState("Error");
				oSource.setValueStateText(oResourceBundle.getText("error.input.lowerZero"));
			} else if (Number(sValue) > 20 && Number(sValue) !== 25) {
				oSource.setValueState("Error");
				oSource.setValueStateText(oResourceBundle.getText("error.input.tooHigh"));
			} else {
				oSource.setValueState("None");
				oSource.setValueStateText("");
			}
		},

		onSubmitPress: function () {
			//Prüfen, ob alle Eingabgen getätigt wurden
			let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			let oUploader = this.byId("fileUploader");

			if (oUploader.getValue() === "") {
				this._showError(oResourceBundle.getText("message.upload.noFile"));
				return;
			}

			let oModel = this.getView().getModel();
			let sPath = this.classifyImage(oModel.getProperty("/Input/0/Factor"), 
			oModel.getProperty("/Input/1/Factor"), oModel.getProperty("/Input/2/Factor"),
			oModel.getProperty("/Input/0/Amount"), oModel.getProperty("/Input/1/Amount"), oModel.getProperty("/Input/2/Amount") );

			oModel.setProperty("/Path", sPath);
			//Daten hochladen
			this.getView().getModel().setProperty("/Busy", true);
			oUploader.upload();
		},

		onRejectPress: function () {
			this._resetView();
		},

		_resetView: function () {
			this.resetModel();
			this._initFileUploader();
		},

		handleUploadComplete: function (oEvent) {
			this.getView().getModel().setProperty("/Busy", false);

			let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

			let sResponse = oEvent.getParameter("responseRaw");
			let sStatus = oEvent.getParameter("status");
			if (sStatus == 200) {

				sap.m.MessageToast.show(oResourceBundle.getText("message.upload.success"));

				this._resetView();
			} else {
				this._showError(sResponse);
			}
		},

		_showError: function (sErrorMessage) {
			let oDialog = new Dialog({
				title: 'Error',
				type: 'Message',
				state: 'Error',
				content: new Text({
					text: sErrorMessage
				}),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: 'OK',
					press: function () {
						oDialog.close();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
		},

		_initFileUploader: function() {
			let oFileUploader = this.byId("fileUploader");

			oFileUploader.clear();
			this.getView().getModel().setProperty("/Busy", false);
			oFileUploader.setFileType(["jpg", "png", "bmp"]);
		},

		classifyImage: function(factor0, factor1, factor2, amount0, amount1, amount2) {
            let aPoints = [];
            let sPathToSaveImageIn =  "./uploads/";

            aPoints.push({
                factor: Number(factor0),
                amount: Number(amount0)
            });

            aPoints.push({
                factor: Number(factor1),
                amount: Number(amount1)
            });
            aPoints.push({
                factor: Number(factor2),
                amount: Number(amount2)
            });

            //Sortiere
            aPoints.sort(function(a,b){
                if (a.factor < b.factor) {
                    return -1;
                }

                if (a.factor > b.factor) {
                    return 1;
                }
                if (a.factor === b.factor) {
                    if(a.amount < b.amount) {
                        return -1;
                    } else if (a.amount > b.amount ) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });

            //Setze den ersten Pfad zusammen
            for(let i = 0; i < 3; i++) {
                let oObject = aPoints[i];
                if(oObject.amount !== 0) {

                    let sAmount = oObject.amount < 10 ? "0" + oObject.amount : "" + oObject.amount;
                    sPathToSaveImageIn += oObject.factor + sAmount;
                }
            }

			if(aPoints[2].amount === 0) {
				sPathToSaveImageIn += "0"
			}
			
            return sPathToSaveImageIn;
        }
	});
});