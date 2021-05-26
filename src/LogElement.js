import ListGroup from 'react-bootstrap/ListGroup';
import React, {useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form'
import './LogElement.css';
import axios from 'axios';

let interReadLog = null;

function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

export default function LogElement() {
    const [lines, setLines] = useState(['Loading...']);
    const [start, setStart] = useState(true);
    const [refreshNumber, setrefreshNumber] = useState(5);
    const [buttonText, setButtonText] = useState('Pause');
  
    let refreshNr = refreshNumber;

   


    async function getLog(){
        if(!start) return;
        try {
            console.log('GET');
            const response = await axios.get(`http://localhost:${process.env.BACK_PORT ?? 3001}/log`);
            if(response?.data?.data) {
                setLines(response.data.data);
            }
        } catch (error) {
            console.log('Error: ' +error);
        }
    }

    async function startInter(){
        await getLog();
        clearInterval(interReadLog);
        interReadLog = setInterval(async() => await getLog(),refreshNumber*1000);
        // interReadLog = useInterval(async() => await getLog(),refreshNumber*1000);
        console.log('Start polling...');
    }

    function stopInter(){
        console.log('Stop polling...');
        clearInterval(interReadLog);
        interReadLog = null;
    }

    function toggle(){
        setStart(!start);
    }

    useEffect(() => {
        (async ()=> await startInter())();
        return () => {
            clearInterval(interReadLog);
        };
    },[])

    useEffect(() => {
        if(start) {
            startInter();
            setButtonText('Stop');
        }
        else {
            stopInter();
            setButtonText('Start');
        }
    },[start]);

    return (
        <>
            <div id="container">
                <Button variant="primary" onClick={toggle} id="btStart">{buttonText}</Button>{' '}
                {/* <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                        <InputGroup.Text id="inputGroup-sizing-default" type="number" value={refreshNumber}>Intervall in s</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                    />
                </InputGroup> */}
                <ListGroup>
                    {lines.map(l => {
                        return <ListGroup.Item>{l}</ListGroup.Item>
                    })}

                </ListGroup>
                {!lines && 'Loading...'}
            </div>
        </>
    )
}
