<template>
  <v-app>
    <v-app-bar dense app color="primary" dark>
      <v-app-bar-title>PDF Generator</v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn color="secondary" href="scanner.html">Scanner</v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="pb-16">
        <v-form>
          <div class="text-h6">Personal information</div>

          <v-text-field v-model="formData.name" label="Name" autocomplete="name"></v-text-field>

          <v-text-field v-model="formData.national_id" label="Natianal ID" autocomplete="off"></v-text-field>

          <v-text-field
            type="date"
            v-model="formData.birthday"
            label="Birthday"
            autocomplete="off"
            clearable
          ></v-text-field>

          <v-radio-group v-model="formData.gender" label="Gender" row>
            <v-radio label="Male" value="M"></v-radio>
            <v-radio label="Female" value="F"></v-radio>
          </v-radio-group>

          <v-text-field v-model="formData.address" label="Address" autocomplete="address"></v-text-field>

          <v-text-field v-model="formData.phone" label="Phone" autocomplete="phone"></v-text-field>

          <v-btn color="primary" @click="generatePdf">Download PDF</v-btn>
        </v-form>

        <fieldset class="mt-5" style="padding: 20px">
          <legend>Test tools</legend>
          <div class="d-flex flex-row flex-wrap" style="align-items: center">
            <v-switch class="mr-2" v-model="autoDownload" label="Auto download"></v-switch>
            <v-btn class="mr-2" color="primary" @click="randomData">Random data</v-btn>
          </div>

          <embed id="pdf" style="width: 100%; height: 1000px" type="application/pdf" />

          <div id="qrcode"></div>
        </fieldset>
      </v-container>

      <v-overlay :value="loadingAnimate">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </v-main>
  </v-app>
</template>

<script>
import { formKeys, idx2key } from '../../plugins/util'
import { faker } from '@faker-js/faker'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { BrowserQRCodeSvgWriter } from '@zxing/browser'
import { EncodeHintType } from '@zxing/library'
import ErrorCorrectionLevel from '@zxing/library/esm/core/qrcode/decoder/ErrorCorrectionLevel'

export default {
  name: 'App',

  components: {},

  data() {
    let res = {
      autoDownload: false,
      loadingAnimate: false,
      formData: {},
    }

    formKeys.forEach((key) => {
      res.formData[key] = null
    })

    return res
  },

  created() {},

  methods: {
    async generatePdf() {
      this.loadingAnimate = true

      const url = 'form.pdf'
      const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer())

      const pdfDoc = await PDFDocument.load(existingPdfBytes)

      pdfDoc.registerFontkit(fontkit)

      const fontUrl = 'kaiu.ttf'
      const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer())
      const kaiuFont = await pdfDoc.embedFont(fontBytes, { subset: true })

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

      const pages = pdfDoc.getPages()
      const firstPage = pages[0]

      var putText = function (text, x, y, fontSize, center, font) {
        if (!text) {
          return
        }

        text = text.toString()
        fontSize = fontSize || 12
        center = center || false
        if (center) {
          var textWidth = font.widthOfTextAtSize(text, fontSize)
          x = x - textWidth / 2
        }

        firstPage.drawText(text, {
          x: x,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        })
      }
      var putZhText = function (text, pos) {
        putText(text, pos[0], pos[1], pos[2], pos[3], kaiuFont)
      }
      var putEnText = function (text, pos) {
        putText(text, pos[0], pos[1], pos[2], pos[3], helveticaFont)
      }

      putZhText(this.formData.name, [170, 664])
      putEnText(this.formData.national_id, [170, 642])
      putEnText(this.formData.birthday, [170, 620])
      if (this.formData.gender === 'M') {
        putEnText('V', [167, 598])
      } else if (this.formData.gender === 'F') {
        putEnText('V', [213, 598])
      }
      putZhText(this.formData.address, [170, 576])
      putEnText(this.formData.phone, [170, 554])
      putEnText(new Date().toISOString().substr(0, 10), [170, 532])

      let compressedData = {}
      formKeys.forEach((key, idx) => {
        if (this.formData[key]) {
          compressedData[idx2key(idx)] = this.formData[key]
        }
      })

      const codeWriter = new BrowserQRCodeSvgWriter()

      let dataQuery = new URLSearchParams(compressedData).toString()
      dataQuery = decodeURI(dataQuery)

      if (dataQuery === '') {
        this.loadingAnimate = false
        return
      }

      let hints = new Map()
      // hints.set(EncodeHintType.MARGIN, 1)
      hints.set(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.L)
      const qrCodeSize = 140
      console.log(dataQuery)
      const qrCode = codeWriter.write(dataQuery, 1, 1, hints)
      // const qrCode2 = codeWriter.write(dataQuery, 1, 1, hints)
      // window.qrCode = qrCode2
      qrCode.height.baseVal.value = qrCodeSize
      qrCode.width.baseVal.value = qrCodeSize

      // document.getElementById('qrcode').innerHTML = ''
      // document.getElementById('qrcode').append(qrCode)
      // codeWriter.writeToDom('#qrcode', dataQuery, 1, 1, hints)

      const xml = new XMLSerializer().serializeToString(qrCode)
      const data = 'data:image/svg+xml;base64,' + btoa(xml)

      var canvas = document.createElement('canvas')
      var ctx = canvas.getContext('2d')
      ctx.canvas.width = qrCodeSize
      ctx.canvas.height = qrCodeSize
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      var img = document.createElement('img')
      img.setAttribute('src', data)
      img.onload = async () => {
        ctx.drawImage(img, 0, 0)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, qrCodeSize)
        ctx.lineTo(qrCodeSize, qrCodeSize)
        ctx.lineTo(qrCodeSize, 0)
        ctx.lineTo(0, 0)
        ctx.stroke()

        const pngImage = await pdfDoc.embedPng(canvas.toDataURL('image/png'))
        // const pngDims = pngImage.scale(0.5)
        firstPage.drawImage(pngImage, {
          x: 365,
          y: 533,
          width: qrCodeSize,
          height: qrCodeSize,
        })

        const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true })
        document.getElementById('pdf').src = pdfDataUri

        var fileLink = document.createElement('a')
        fileLink.href = pdfDataUri
        fileLink.setAttribute('target', '_blank')
        fileLink.setAttribute('download', 'test.pdf')
        if (this.autoDownload) {
          fileLink.click()
          this.dialogSubmit = true
        }

        this.loadingAnimate = false
      }
    },
    randomData() {
      faker.locale = 'zh_TW'
      this.formData.name = faker.name.lastName() + faker.name.firstName()
      this.formData.national_id = faker.random.alpha({ count: 1, casing: 'upper' }) + faker.random.numeric(9)
      this.formData.birthday = faker.date.birthdate().toISOString().substr(0, 10)
      this.formData.gender = faker.helpers.arrayElement(['M', 'F'])
      this.formData.address = faker.address.city() + faker.address.streetAddress()
      this.formData.phone = faker.phone.number()

      this.generatePdf()
    },
  },
}
</script>

<style scoped>
.v-btn {
  text-transform: unset;
}
</style>
