import React, { useState, useEffect } from 'react';
import { Button, ButtonToolbar, FlexboxGrid, Form, FormControl, FormGroup } from 'rsuite';
import Wallet from 'ethereumjs-wallet'
import { useWalletStorage } from '../../../store/wallet';
import { useHistory } from 'react-router-dom';

const CreateByKeystore = () => {
    const [password, setPassword] = useState('');
    const [blobUrl, setBlobUrl] = useState('')
    const [keystoreFilename, setKeystoreFilename] = useState('')
    const [isLoading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [walletStored, setWalletStored] = useWalletStorage()
    const [privateKey, setPrivateKey] = useState('')
    let history = useHistory();
    const createWallet = async () => {
        if(!password) {
            setErrorMessage('This field is required')
            return;
        }
        setLoading(true)
        // Generate wallet
        const wallet = Wallet.generate();
        setPrivateKey(wallet.getPrivateKeyString())
        const keystoreFilename = wallet.getV3Filename();
        const keystoreJson = await wallet.toV3(password);
        const keystoreJsonString = JSON.stringify(keystoreJson);
        const keystoreBlob = new Blob([keystoreJsonString], {
          type: 'mime',
        });
        setBlobUrl(window.URL.createObjectURL(keystoreBlob));
        setKeystoreFilename(keystoreFilename);
        setLoading(false)
    }

    const accessWallet = async() => {
        if(!privateKey) return;
        setWalletStored({privatekey: privateKey, isAccess: true})
        history.push("/dashboard");
    }

    useEffect(() => {
        if(password) {
            setErrorMessage('')
        }
    }, [password]);    

    return !blobUrl ? (
        <div className="show-grid creact-by-keystore">
            <FlexboxGrid justify="start">
                <div className="note-warning">
                    <Form fluid>
                        <FormGroup>
                            <FormControl errorMessage={errorMessage} placeholder="Password*" name="password" type="password" value={password} onChange={setPassword} />
                        </FormGroup>
                        <div>You will need <b>BOTH</b> your <b>Password + Keystore File</b> to access your wallet.</div>
                        <FormGroup>
                            <ButtonToolbar>
                                <Button appearance="primary" loading={isLoading} onClick={createWallet}>Create wallet</Button>
                            </ButtonToolbar>
                        </FormGroup>
                    </Form>
                </div>
            </FlexboxGrid>
        </div>
    ) : (
        <div className="show-grid creact-by-keystore">
            <FlexboxGrid justify="start">
                <div className="note-warning">
                <div>Please download and save the following Keystore File. You will need it and your password to access your wallet.</div>
                <div className="download-keystore-file">
                    <a href={blobUrl} download={keystoreFilename}>
                        Download Keystore File
                    </a>
                </div>
                <ButtonToolbar>
                    <Button appearance="primary" onClick={accessWallet}>Access now</Button>
                </ButtonToolbar>
                </div>
            </FlexboxGrid>
        </div>
    );
}

export default CreateByKeystore;
