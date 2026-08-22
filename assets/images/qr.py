import qrcode

url = ""

qr = qrcode.QRCode(
    version= 1,
    box_size=25,
    border=5
)

qr.add_data(url)
qr.make(fit=True)

imagen = qr.make_image()
imagen.save("qr.png")