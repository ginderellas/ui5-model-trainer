sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
], function (Controller, formatter, JSONModel, Dialog) {
	"use strict";

	return Controller.extend("sap.ui.demo.basicTemplate.controller.App", {

		formatter: formatter,

		onInit: function () {
			this._resetView();
		},

		resetModel: function () {
			let oModel = new JSONModel({
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

			//Daten hochladen
			oUploader.upload();
		},

		onRejectPress: function () {
			this._resetView();
		},

		_resetView: function () {
			this.resetModel();
			this.byId("fileUploader").clear();
		},

		handleUploadComplete: function (oEvent) {
			let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			let sStatus = oEvent.getParameter("status");
			if (sStatus.startsWith("2")) {

				sap.m.MessageToast.show(oResourceBundle.getText("message.upload.success"));

				this._resetView();
			} else {
				this._showError(oSource.getParameter("response"));
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
		}
	});
});