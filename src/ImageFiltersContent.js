import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Modal, Select, Radio , InputNumber, Spin} from 'antd';
import Plotly from 'plotly.js-dist'

const { Option } = Select;

const ImageFiltersContent = () => {

  const [imgDim, setImgDim] = useState([0, 0]);
  const [originalPixels, setOriginalPixels] = useState(null);
  const [grayPixels, setGrayPixels] = useState(null);
  const [currentPixels, setCurrentPixels] = useState(null);
  const [imgData, setImgData] = useState(null);
  const [ctxResG, setCtxResG] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleHist, setIsModalVisibleHist] = useState(false);
  const [size, setSize] = React.useState("3");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingHist, setLoadingHist] = useState(false);

  const handleSizeChange = e => {
    setSize(e.target.value);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };
  const showModalHist = () => {
    setIsModalVisibleHist(true);
    setLoadingHist(true);
    let freqs = {}
    for (let i = 0; i < currentPixels.length; i++) {
      const value = currentPixels[i];
      if(!freqs[value]) freqs[value] = 0;
      freqs[value] += 1;
    }
    var data = [
      {
        x: currentPixels,
        type: 'histogram',
        marker: {
          color: 'pink',
        },
      }
    ];
    setTimeout(() => {
      Plotly.newPlot('myDiv', data);
      setLoadingHist(false);
    }, 1000)
  };

  const handleOkHist = () => {
    setIsModalVisibleHist(false);
    document.getElementById("myDiv").innerHTML = "";
  }

  const handleOk = () => {
    setIsModalVisible(false);
    const n = parseInt(size);
    const resize = parseInt(n / 2);
    let filter = [];
    for (let i = 0; i < n; i++) {
      let tempRow = [];
      for (let j = 0; j < n; j++) {
        const val = document.getElementById(`input-${i}-${j}`).value;
        tempRow.push(val)
      }
      filter.push(tempRow)
    }
    if (!grayPixels) onClickGray();
    let newPixels = [...grayPixels];
    for (let i = 0; i < imgDim[0]; i++) {
      for (let j = 0; j < imgDim[1]; j++) {
        let a = i - resize;
        let b = j - resize;
        let convRes = 0;
        for (let u = a; u < a + n; u++) {
          for (let v = b; v < b + n; v++) {
            const fival = filter[u - a][v - b];
            const pival = newPixels[getIndex(u, v)] || 0;
            convRes += (fival * pival);
          }
        }
        const redIndex = getIndex(i, j);
        const greenIndex = getIndex(i, j) + 1;
        const blueIndex = getIndex(i, j) + 2;
        newPixels[redIndex] = clamp(convRes);
        newPixels[greenIndex] = clamp(convRes);
        newPixels[blueIndex] = clamp(convRes);
      }
    }
    setCurrentPixels(newPixels);
    commitChanges(newPixels);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleCancelHist = () => {
    setIsModalVisibleHist(false);
    document.getElementById("myDiv").innerHTML = "";
  };

  function getIndex(x, y) {
    return (x + y * imgDim[0]) * 4
  }

  function clamp(value) {
    return Math.max(0, Math.min(Math.floor(value), 255))
  }

  function commitChanges(pixels) {
    for (let i = 0; i < imgData.data.length; i++) {
      imgData.data[i] = pixels[i]
    }
  
    ctxResG.putImageData(imgData, 0, 0, 0, 0, imgDim[0], imgDim[1])
  }

  const onClickGray = () => {
    const newPixels = [...originalPixels];
    for (let i = 0; i < imgDim[0]; i++) {
      for (let j = 0; j < imgDim[1]; j++) {
        const redIndex = getIndex(i, j);
        const greenIndex = getIndex(i, j) + 1;
        const blueIndex = getIndex(i, j) + 2;
        const red = originalPixels[redIndex];
        const green = originalPixels[greenIndex];
        const blue = originalPixels[blueIndex];
        const gray = (red + green + blue) / 3;
        newPixels[redIndex] = clamp(gray);
        newPixels[greenIndex] = clamp(gray);
        newPixels[blueIndex] = clamp(gray);
      }
    }
    setGrayPixels(newPixels);
    setCurrentPixels(newPixels);
    commitChanges(newPixels);
  }

  const resetImage = () => {
    setCurrentPixels(originalPixels);
    commitChanges(originalPixels);
  }

  useEffect(() => {
    const fileinput = document.getElementById('fileinput')
    const canvas = document.getElementById('canvas')
    const canvasRes = document.getElementById('canvas-result')
    const ctx = canvas.getContext('2d')
    const ctxRes = canvasRes.getContext('2d')
    setCtxResG(ctxRes);
    const srcImage = new Image

    let imgData = null

    fileinput.onchange = function (e) {
      if (e.target.files && e.target.files.item(0)) {
        srcImage.src = URL.createObjectURL(e.target.files[0])
      }
    }

    srcImage.onload = function () {
      setImageLoaded(true)
      canvas.width = srcImage.width
      canvas.height = srcImage.height
      canvasRes.width = srcImage.width
      canvasRes.height = srcImage.height
      console.log([srcImage.width, srcImage.height]);
      setImgDim([srcImage.width, srcImage.height]);
      ctx.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height)
      ctxRes.drawImage(srcImage, 0, 0, srcImage.width, srcImage.height)
      imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height)
      const pixs = imgData.data.slice();
      setOriginalPixels(pixs);
      setCurrentPixels(pixs)
      setImgData(imgData);
    }
  })

  return (
    <Row gutter={[16, 24]}>
      <Col className="gutter-row" span={24}>
        <Row gutter={16}>
          <Col className="gutter-row" span={6}>
            <h2>Seleccione una imagen: </h2>
            <input type="file" accept="image/*" id="fileinput" />
          </Col>
        </Row>
      </Col>
      <Col className="gutter-row" span={24}>
        <Row gutter={16}>
          <Col className="gutter-row" span={12}>
            <Button disabled={!imageLoaded} type="primary" style={{width: "100%"}} onClick={resetImage}>Resetar imagen</Button>
          </Col>
          <Col className="gutter-row" span={12}>
            <Button disabled={!imageLoaded} type="primary" style={{width: "100%"}} onClick={onClickGray}>Escala de grises</Button>
          </Col>
        </Row>
      </Col>
      <Col className="gutter-row" span={24}>
        <Row gutter={16}>
          <Col className="gutter-row" span={12} onClick={showModal}>
            <Button disabled={!imageLoaded} type="primary" style={{width: "100%"}}>Pasar por un filtro</Button>
          </Col>
          <Col className="gutter-row" span={12} onClick={showModalHist}>
            <Button disabled={!imageLoaded} type="primary" style={{width: "100%"}}>Mostrar histograma</Button>
          </Col>
        </Row>
      </Col>
      <Col className="gutter-row" span={12}>
        <canvas id="canvas" width="0" height="0"></canvas>
      </Col>
      <Col className="gutter-row" span={12}>
        <canvas id="canvas-result" width="0" height="0"></canvas>
      </Col>
      <Modal title="Inserte el filtro" visible={isModalVisible} width="70%" onOk={handleOk} onCancel={handleCancel}>
        <Radio.Group value={size} onChange={handleSizeChange}>
          <Radio.Button value="3">3 x 3</Radio.Button>
          <Radio.Button value="5">5 x 5</Radio.Button>
          <Radio.Button value="7">7 x 7</Radio.Button>
        </Radio.Group>
        <h3>Filtro: </h3>
        {new Array(parseInt(size)).fill(0).map((_, i) => (
          <Row gutter={16} key={i}>
            {new Array(parseInt(size)).fill(0).map((_, j) => (
              <Col className="gutter-row" span={3}>
                <InputNumber key={j} id={`input-${i}-${j}`} defaultValue={0} />
              </Col>
            ))}
          </Row>
        ))}
      </Modal>
      <Modal title="Histograma" visible={isModalVisibleHist} width="70%" onOk={handleOkHist} onCancel={handleCancelHist}>
        {loadingHist && <div style={{margin: "30px 50%"}}><Spin size="large" /> </div>}
        <div id="myDiv" ></div>
      </Modal>
    </Row>
  );
};

export default ImageFiltersContent;