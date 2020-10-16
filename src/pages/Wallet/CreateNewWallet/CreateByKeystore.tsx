import React, { useState, useEffect } from 'react';
import { Button, Col, FlexboxGrid, Form, FormControl, FormGroup, Panel } from 'rsuite';
import Wallet from 'ethereumjs-wallet'
import { useWalletStorage } from '../../../service/wallet';
import { Link, useHistory } from 'react-router-dom';
import ErrMessage from '../../../common/components/InputErrMessage/InputErrMessage';
import { ErrorMessage } from '../../../common/constant/Message';

const CreateByKeystore = () => {
    const [password, setPassword] = useState('');
    const [blobUrl, setBlobUrl] = useState('')
    const [keystoreFilename, setKeystoreFilename] = useState('')
    const [isLoading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [walletStored, setWalletStored] = useWalletStorage(() => history.push('/dashboard/send-transaction'))
    const [wallet, setWallet] = useState({} as WalletStore)
    let history = useHistory();


    // create wallet
    const createWallet = async () => {
        if (!password) {
            setErrorMessage(ErrorMessage.Require)
            return;
        }
        setLoading(true)
        // Generate wallet
        const wallet = Wallet.generate();
        const keystoreFilename = wallet.getV3Filename();
        const keystoreJson = await wallet.toV3(password);
        const keystoreJsonString = JSON.stringify(keystoreJson);
        const keystoreBlob = new Blob([keystoreJsonString], {
            type: 'mime',
        });
        setWallet({
            privatekey: wallet.getPrivateKeyString(),
            address: wallet.getAddressString(),
            isAccess: false
        })
        setBlobUrl(window.URL.createObjectURL(keystoreBlob));
        setKeystoreFilename(keystoreFilename);
        setLoading(false)
    }

    // access wallet now
    const accessWallet = async () => {
        if (!wallet.privatekey) return;
        const newWallet = JSON.parse(JSON.stringify(wallet))
        newWallet.isAccess = true;
        setWalletStored(newWallet)
    }

    useEffect(() => {
        if (password) {
            setErrorMessage('')
        }
    }, [password]);

    return (
        <div className="show-grid creact-container">
            <FlexboxGrid justify="center">
                <Panel shaded>
                    <FlexboxGrid justify="center">
                        <div className="title">CREATE WITH KEYSTORED FILE</div>
                    </FlexboxGrid>
                    {
                        !blobUrl ? (
                            <FlexboxGrid justify="center">
                                <FlexboxGrid.Item componentClass={Col} colspan={22} md={24}>
                                    <div className="text-container">
                                        <Form fluid>
                                            <FormGroup>
                                                <FormControl placeholder="Password*" name="password" type="password" value={password} onChange={setPassword} />
                                                <ErrMessage message={errorMessage} />
                                            </FormGroup>
                                            <div>You will need <b>BOTH</b> your <b>Password + Keystore File</b> to access your wallet.</div>
                                        </Form>
                                    </div>
                                    <div className="button-container">
                                        <Link to="/create-wallet">
                                            <Button appearance="ghost">Back</Button>
                                        </Link>
                                        <Button appearance="primary" className="submit-buttom" loading={isLoading} onClick={createWallet}>Create wallet</Button>
                                    </div>
                                </FlexboxGrid.Item>
                            </FlexboxGrid>
                        ) : (
                                <FlexboxGrid justify="center">
                                    <FlexboxGrid.Item componentClass={Col} colspan={22} md={24}>
                                        <div className="text-container">
                                            <div>Please download and save the following Keystore File. You will need it and your password to access your wallet.</div>
                                        </div>
                                    </FlexboxGrid.Item>
                                    <FlexboxGrid.Item componentClass={Col} colspan={22} md={24}>
                                        <div className="download-keystore-file">
                                            <a href={blobUrl} download={keystoreFilename}>
                                                Download Keystore File
                                            </a>
                                        </div>
                                    </FlexboxGrid.Item>
                                    <FlexboxGrid.Item componentClass={Col} colspan={22} md={24}>
                                        <div className="button-container">
                                            <Link to="/create-wallet">
                                                <Button appearance="ghost">Back</Button>
                                            </Link>
                                            <Button appearance="primary" className="submit-buttom" onClick={accessWallet}>Access now</Button>
                                        </div>
                                    </FlexboxGrid.Item>
                                </FlexboxGrid>
                            )
                    }
                </Panel>
            </FlexboxGrid>
        </div>
    )
}

export default CreateByKeystore;
