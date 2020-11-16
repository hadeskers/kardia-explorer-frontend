import React, { useEffect, useState } from 'react'
import { Alert, Col, ControlLabel, FlexboxGrid, Form, FormControl, Modal, SelectPicker } from 'rsuite';
import Button from '../../../../common/components/Button';
import ErrMessage from '../../../../common/components/InputErrMessage/InputErrMessage';
import { gasLimitDefault, gasPriceOption } from '../../../../common/constant';
import { ErrorMessage } from '../../../../common/constant/Message';
import { weiToKAI } from '../../../../common/utils/amount';
import { onlyInteger, onlyNumber } from '../../../../common/utils/number';
import { renderHashToRedirect } from '../../../../common/utils/string';
import { getBalance } from '../../../../service/kai-explorer';
import { createValidator } from '../../../../service/smc/staking';
import { getAccount } from '../../../../service/wallet';
import './validators.css'
import Helper from '../../../../common/components/Helper';
import { HelperMessage } from '../../../../common/constant/HelperMessage';

const ValidatorCreate = () => {

    const [isLoading, setIsLoading] = useState(false)
    const [commissionRate, setCommissionRate] = useState('')
    const [maxRate, setMaxRate] = useState('')
    const [maxChangeRate, setMaxChangeRate] = useState('')
    const [minSelfDelegation, setMinSelfDelegation] = useState('')
    const [amountDel, setAmountDel] = useState('')

    const [commissionRateErr, setCommissionRateErr] = useState('')
    const [maxRateErr, setMaxRateErr] = useState('')
    const [maxChangeRateErr, setMaxChangeRateErr] = useState('')
    const [maxMinSelfDelegationErr, setMaxMinSelfDelegationErr] = useState('')
    const [amountDelErr, setAmountDelErr] = useState('')

    const [hashTransaction, setHashTransaction] = useState('')
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [createValErrMsg, setCreateValErrMsg] = useState('')
    const [balance, setBalance] = useState(0)
    const myAccount = getAccount() as Account

    const [gasPrice, setGasPrice] = useState(1)
    const [gasPriceErr, setGasPriceErr] = useState('')
    const [gasLimit, setGasLimit] = useState(gasLimitDefault)
    const [gasLimitErr, setGasLimitErr] = useState('')

    useEffect(() => {
        (async () => {
            const bal = await getBalance(myAccount.publickey)
            setBalance(Number(weiToKAI(bal)))
        })()
    }, [myAccount.publickey])

    const validateCommissionRate = (value: any) => {
        if (!value) {
            setCommissionRateErr(ErrorMessage.Require)
            return false
        }
        if (Number(value) === 0) {
            setCommissionRateErr(ErrorMessage.ValueInvalid)
            return false
        }

        // The commission value cannot be more than 100%
        if (Number(value) > 100) {
            setCommissionRateErr(ErrorMessage.CommissionRateMoreThanHundred)
            return false
        }

        //commission rate cannot be more than the max rate
        if (Number(value) > Number(maxRate)) {
            setCommissionRateErr(ErrorMessage.CommissionRateMoreThanMaxRate)
            return false
        }
        setCommissionRateErr('')
        return true
    }

    const validateMaxRate = (value: any) => {
        if (!value) {
            setMaxRateErr(ErrorMessage.Require)
            return false
        }
        if (Number(value) === 0) {
            setMaxRateErr(ErrorMessage.ValueInvalid)
            return false
        }

        // The commission max rate value cannot be more than 100%
        if (Number(value) > 100) {
            setMaxRateErr(ErrorMessage.MaxRateMoreThanHundred)
            return false
        }

        //commission rate cannot be more than the max rate
        if (Number(value) < Number(commissionRate)) {
            setCommissionRateErr(ErrorMessage.CommissionRateMoreThanMaxRate)
            return false
        } else {
            setCommissionRateErr('')
        }

        //commission max change rate can not be more than the max rate
        if (Number(value) < Number(maxChangeRate)) {
            setMaxChangeRateErr(ErrorMessage.MaxChangeRateMoreThanMaxRate)
            return false
        } else {
            setMaxChangeRateErr('')
        }

        setMaxRateErr('')
        return true
    }

    const validateMaxChangeRate = (value: any) => {
        if (!value) {
            setMaxChangeRateErr(ErrorMessage.Require)
            return false
        }
        if (Number(value) === 0) {
            setMaxChangeRateErr(ErrorMessage.ValueInvalid)
            return false
        }

        // The commission max change rate value cannot be more than 100%
        if (Number(value) > 100) {
            setMaxChangeRateErr(ErrorMessage.MaxChangeRateMoreThanHundred)
            return false
        }

        //commission max change rate can not be more than the max rate
        if (Number(value) > Number(maxRate)) {
            setMaxChangeRateErr(ErrorMessage.MaxChangeRateMoreThanMaxRate)
            return false
        }

        setMaxChangeRateErr('')
        return true
    }

    const validateMinSelfDelegation = (value: any) => {
        if (!value) {
            setMaxMinSelfDelegationErr(ErrorMessage.Require)
            return false
        }
        if (Number(value) === 0) {
            setMaxMinSelfDelegationErr(ErrorMessage.ValueInvalid)
            return false
        }

        // Self-delegated amount is below minimum
        if (Number(value) > Number(amountDel)) {
            setAmountDelErr(ErrorMessage.DelBelowMinimum)
            return false
        } else {
            setAmountDelErr('')
        }
        setMaxMinSelfDelegationErr('')
        return true
    }

    const validateAmountDel = (value: any) => {
        if (!value) {
            setAmountDelErr(ErrorMessage.Require)
            return false
        }
        if (Number(value) === 0) {
            setAmountDelErr(ErrorMessage.ValueInvalid)
            return false
        }

        if (Number(balance) === 0 || Number(balance) < value) {
            setAmountDelErr(ErrorMessage.BalanceNotEnough)
            return false
        }

        // Self-delegated amount is below minimum
        if (Number(value) < Number(minSelfDelegation)) {
            setAmountDelErr(ErrorMessage.DelBelowMinimum)
            return false
        }
        setAmountDelErr('')
        return true
    }


    const validateGasPrice = (gasPrice: any): boolean => {
        if (!Number(gasPrice)) {
            setGasPriceErr(ErrorMessage.Require)
            return false
        }
        setGasPriceErr('')
        return true
    }

    const validateGasLimit = (gas: any): boolean => {
        if (!Number(gas)) {
            setGasLimitErr(ErrorMessage.Require);
            return false;
        }
        setGasLimitErr('')
        return true
    }

    const resetForm = () => {
        setCommissionRate('')
        setMaxRate('')
        setMaxChangeRate('')
        setMinSelfDelegation('')
        setAmountDel('')
    }

    const submitValidator = () => {
        if (!validateGasPrice(gasPrice) || !validateGasLimit(gasLimit) || !validateCommissionRate(commissionRate) || !validateMaxRate(maxRate) || !validateMaxChangeRate(maxChangeRate) || !validateMinSelfDelegation(minSelfDelegation) || !validateAmountDel(amountDel)) {
            return
        }
        setShowConfirmModal(true)
    }

    const registerValidator = async () => {
        setHashTransaction('');
        try {
            setIsLoading(true)
            let account = await getAccount() as Account;
            let validator = await createValidator(Number(commissionRate), Number(maxRate), Number(maxChangeRate), Number(minSelfDelegation), account, Number(amountDel), gasLimit, gasPrice);

            if (validator && validator.status === 1) {
                Alert.success('Create validator success.')
                setHashTransaction(validator.transactionHash)
            } else {
                setCreateValErrMsg('Create validator failed.');
            }
        } catch (error) {
            try {
                const errJson = JSON.parse(error?.message);
                setCreateValErrMsg(`Create validator failed: ${errJson?.error?.message}`)
            } catch (error) {
                setCreateValErrMsg('Create validator failed.');
            }
        }
        resetForm();
        setIsLoading(false)
        setShowConfirmModal(false)
    }

    return (
        <>
            <Form fluid>
                <FlexboxGrid>
                    <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} style={{marginBottom: 15}}>
                        <ControlLabel>Gas Limit:<span className="required-mask">*</span></ControlLabel>
                        <FormControl name="gaslimit"
                            placeholder="Gas Limit"
                            value={gasLimit}
                            onChange={(value) => {
                                if (onlyInteger(value)) {
                                    setGasLimit(value);
                                    validateGasLimit(value)
                                }
                            }}
                            style={{ width: '100%' }}
                        />
                        <ErrMessage message={gasLimitErr} />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} style={{marginBottom: 15}}>
                        <ControlLabel>Gas Price:<span className="required-mask">*</span></ControlLabel>
                        <SelectPicker
                            className="dropdown-custom"
                            data={gasPriceOption}
                            searchable={false}
                            value={gasPrice}
                            onChange={(value) => {
                                setGasPrice(value)
                                validateGasPrice(value)
                            }}
                            style={{ width: '100%' }}
                        />
                        <ErrMessage message={gasPriceErr} />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item componentClass={Col} colspan={24} md={24} style={{marginBottom: 15}}>
                        <ControlLabel>
                            <Helper style={{ marginRight: 5 }} info={HelperMessage.CommissionRate} />
                            Commission Rate (%) <span className="required-mask">*</span>
                        </ControlLabel>
                        <FormControl placeholder="Commission Rate"
                            name="commissionRate"
                            value={commissionRate}
                            onChange={(value) => {
                                if (onlyNumber(value)) {
                                    setCommissionRate(value)
                                    validateCommissionRate(value)
                                }
                            }} />
                        <ErrMessage message={commissionRateErr} />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item componentClass={Col} colspan={24} md={24} style={{marginBottom: 15}}>
                        <ControlLabel>
                            <Helper style={{ marginRight: 5 }} info={HelperMessage.MaxRate} />
                            Max Rate (%) <span className="required-mask">*</span>
                        </ControlLabel>
                        <FormControl placeholder="Max Rate"
                            name="maxRate"
                            value={maxRate}
                            onChange={(value) => {
                                if (onlyNumber(value)) {
                                    setMaxRate(value)
                                    validateMaxRate(value)
                                }
                            }} />
                        <ErrMessage message={maxRateErr} />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item componentClass={Col} colspan={24} md={24} style={{marginBottom: 15}}>
                        <ControlLabel>
                            <Helper style={{ marginRight: 5 }} info={HelperMessage.MaxChangeRate} />
                            Max Change Rate (%) <span className="required-mask">*</span>
                        </ControlLabel>
                        <FormControl placeholder="Max Change Rate"
                            name="maxChangeRate"
                            value={maxChangeRate}
                            onChange={(value) => {
                                if (onlyNumber(value)) {
                                    setMaxChangeRate(value)
                                    validateMaxChangeRate(value)
                                }
                            }} />
                        <ErrMessage message={maxChangeRateErr} />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item componentClass={Col} colspan={24} md={24} style={{marginBottom: 15}}>
                        <ControlLabel>
                            <Helper style={{ marginRight: 5 }} info={HelperMessage.MinSelfDelegation} />
                            Min Self Delegation (KAI) <span className="required-mask">*</span>
                        </ControlLabel>
                        <FormControl placeholder="Min Self Delegation"
                            name="minSelfDelegation"
                            value={minSelfDelegation}
                            onChange={(value) => {
                                if (onlyNumber(value)) {
                                    setMinSelfDelegation(value)
                                    validateMinSelfDelegation(value)
                                }
                            }} />
                        <ErrMessage message={maxMinSelfDelegationErr} />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item componentClass={Col} colspan={24} md={24} style={{marginBottom: 15}}>
                        <ControlLabel>
                            <Helper style={{ marginRight: 5 }} info={HelperMessage.AmountSelftDelegation} />
                            Amount Self Delegation (KAI) <span className="required-mask">*</span>
                        </ControlLabel>
                        <FormControl placeholder="Amount Self Delegation"
                            name="amountDel"
                            value={amountDel}
                            onChange={(value) => {
                                if (onlyNumber(value)) {
                                    setAmountDel(value)
                                    validateAmountDel(value)
                                }
                            }} />
                        <ErrMessage message={amountDelErr} />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item componentClass={Col} colspan={24} md={24} style={{marginBottom: 15}}>
                        <Button size="big" onClick={submitValidator}>Register</Button>
                    </FlexboxGrid.Item>
                </FlexboxGrid>
            </Form>
            <ErrMessage message={createValErrMsg} />
            {
                hashTransaction ? <div style={{ marginTop: '20px', wordBreak: 'break-all' }}>Txs create validator: {renderHashToRedirect({ hash: hashTransaction, headCount: 100, tailCount: 4, showTooltip: false, callback: () => { window.open(`/tx/${hashTransaction}`) } })}</div> : <></>
            }

            {/* Modal confirm when create validator */}
            <Modal backdrop="static" size="sm" enforceFocus={true} show={showConfirmModal} onHide={() => { setShowConfirmModal(false) }}>
                <Modal.Header>
                    <Modal.Title>Confirm create validator</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ fontWeight: 'bold', color: '#36638A', marginBottom: '15px' }}>Are you sure you want to create validator with: </div>
                    <div>Commission Rate: <span style={{ fontWeight: 'bold', color: '#36638A' }}> {commissionRate} %</span></div>
                    <div>Max Rate: <span style={{ fontWeight: 'bold', color: '#36638A' }}> {maxRate} %</span></div>
                    <div>Max Rate Change: <span style={{ fontWeight: 'bold', color: '#36638A' }}> {maxChangeRate} %</span></div>
                    <div>Min Self Delegation: <span style={{ fontWeight: 'bold', color: '#36638A' }}> {minSelfDelegation} KAI</span></div>
                    <div>Amount Self Delegation: <span style={{ fontWeight: 'bold', color: '#36638A' }}> {amountDel} KAI</span></div>
                </Modal.Body>
                <Modal.Footer>
                    <Button loading={isLoading} onClick={registerValidator}>
                        Confirm
                    </Button>
                    <Button className="primary-button" onClick={() => { setShowConfirmModal(false) }}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ValidatorCreate;