import React, { useEffect, useState } from 'react';
import { Col, ControlLabel, FlexboxGrid, Form, FormGroup, List, Modal, SelectPicker } from 'rsuite';
import Button from '../../common/components/Button';
import NumberInputFormat from '../../common/components/FormInput';
import Helper from '../../common/components/Helper';
import ErrMessage from '../../common/components/InputErrMessage/InputErrMessage';
import { ErrorMessage } from '../../common/constant/Message';
import { formatAmount, weiToKAI } from '../../common/utils/amount';
import { numberFormat } from '../../common/utils/number';
import { useViewport } from '../../context/ViewportContext';
import { getLatestBlock } from '../../service/kai-explorer';

interface ValidatorSelectList {
    label: string;
    value: Validator;
}

interface CalcResult {
    _30days: number;
    _90days: number;
    _180days: number;
    _365days: number;
    _apr: number;
}

const StakingCalculator = ({ showModal, setShowModal, validators }: {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    validators: Validator[];
}) => {

    const blockTime = 5
    const [isLoading, setIsLoading] = useState(false)
    const [validatorSelectList, setValidatorSelectList] = useState([] as ValidatorSelectList[])
    const [validator, setValidator] = useState<Validator>()
    const [validatorErr, setValidatorErr] = useState('')
    const [amount, setAmount] = useState('')
    const [amountErr, setAmountErr] = useState('')
    const [calcResult, setCalcResult] = useState<CalcResult>()
    const [blockReward, setBlockReward] = useState(0);
    const { isMobile } = useViewport()

    useEffect(() => {
        // Get blocks
        (async () => {
            const block = await getLatestBlock();
            setBlockReward(Number(weiToKAI(block.rewards)));
        })()

        const vals = validators.map((item: Validator) => {
            return {
                label: `${item.name}`,
                value: item
            }
        })
        setValidatorSelectList(vals)
    }, [validators]);

    const validateAmount = (amount: any) => {
        if (!amount) {
            setAmountErr(ErrorMessage.Require)
            return false
        }

        setAmountErr('')
        return true
    }

    const validateValidator = (val: Validator) => {
        if (!val || !val.address) {
            setValidatorErr(ErrorMessage.Require)
            return false
        }

        setValidatorErr('')
        return true
    }

    const calculate = () => {
        if (!validateAmount(amount) || !validateValidator(validator || {} as Validator)) {
            return
        }
        setIsLoading(true)
        try {
            const votingPower = validator?.votingPower ? Number(validator.votingPower) / 100 : 0;
            const commission = validator?.commissionRate ? Number(validator.commissionRate) / 100 : 0;
            const totalStaked = validator?.stakedAmount ? Number(weiToKAI(validator.stakedAmount)) + Number(amount) : 0;

            // Calculate reward for all delegator of validator for each block
            const delegatorsReward = blockReward * (1 - commission) * votingPower;

            // Calculate your reward on each block
            const yourReward = Number(amount) / totalStaked * delegatorsReward

            // Calculate staker earning 
            const _30days = yourReward * (30 * 24 * 3600) / blockTime;
            const _90days = yourReward * (90 * 24 * 3600) / blockTime;
            const _180days = yourReward * (180 * 24 * 3600) / blockTime;
            const _365days = yourReward * (365 * 24 * 3600) / blockTime;

            // Calculate APR (%)
            const _apr = yourReward * (365 * 24 * 3600) / blockTime / Number(amount) * 100;
            setCalcResult({
                _30days: _30days,
                _90days: _90days,
                _180days: _180days,
                _365days: _365days,
                _apr: _apr
            })
        } catch (error) {
            console.log(error);
        }
        setIsLoading(false)
    }

    const reset = () => {
        setValidator({} as Validator)
        setAmount('')
        setCalcResult(undefined)
        setAmountErr('')
        setValidatorErr('')
    }

    return (
        <Modal backdrop="static" size={isMobile ? 'sm' : 'md'} enforceFocus={true} show={showModal}
            onHide={() => {
                setShowModal(false)
                reset()
            }}>
            <Modal.Header>
                <Modal.Title>Staking Calculator</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form fluid>
                    <FormGroup>
                        <FlexboxGrid justify="space-between">
                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={24} sm={24} style={{ marginBottom: 10 }}>
                                <ControlLabel className="color-white">Validator (required)</ControlLabel>
                                <SelectPicker
                                    placeholder="Choose validator"
                                    className="dropdown-custom"
                                    data={validatorSelectList}
                                    searchable={true}
                                    value={validator}
                                    onChange={(value) => {
                                        setValidator(value)
                                        validateValidator(value)
                                    }}
                                    style={{ width: '100%' }}
                                />
                                <ErrMessage message={validatorErr} />
                            </FlexboxGrid.Item>
                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={24} sm={24} style={{ marginBottom: 20 }}>
                                <ControlLabel className="color-white">Enter your KAI amount (required)</ControlLabel>
                                <NumberInputFormat
                                    value={amount}
                                    placeholder="Ex. 25,000"
                                    className="input"
                                    onChange={(event) => {
                                        setAmount(event.value);
                                        validateAmount(event.value)
                                    }} />
                                <ErrMessage message={amountErr} />
                            </FlexboxGrid.Item>
                        </FlexboxGrid>
                    </FormGroup>
                </Form>
                {/* <Divider /> */}
                <FlexboxGrid justify="space-between">
                    {/* Validator's stats */}
                    {
                        validator && validator?.address ? (
                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} sm={24} style={{ marginBottom: 20 }}>
                                <List>
                                    <List.Item>
                                        <FlexboxGrid justify="start" align="middle">
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={24} xs={24}>
                                                <div className="property-title fs-24" >Validator's Stats</div>
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </List.Item>
                                    <List.Item>
                                        <FlexboxGrid justify="start" align="middle">
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-title">Validator Name</div>
                                            </FlexboxGrid.Item>
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-content">
                                                    {validator.name ? validator.name : ''}
                                                </div>
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </List.Item>
                                    <List.Item>
                                        <FlexboxGrid justify="start" align="middle">
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-title">Commission (%)</div>
                                            </FlexboxGrid.Item>
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-content">
                                                    {numberFormat(validator?.commissionRate || 0, 2)}
                                                </div>
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </List.Item>
                                    <List.Item>
                                        <FlexboxGrid justify="start" align="middle">
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-title">Staked Amount (KAI)</div>
                                            </FlexboxGrid.Item>
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-content">
                                                    {formatAmount(Number(weiToKAI(validator?.stakedAmount)))}
                                                </div>
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </List.Item>
                                    <List.Item>
                                        <FlexboxGrid justify="start" align="middle">
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-title">Voting Power (%)</div>
                                            </FlexboxGrid.Item>
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-content">
                                                    {validator?.votingPower || 0}
                                                </div>
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </List.Item>
                                </List>
                            </FlexboxGrid.Item>
                        ) : <></>
                    }
                    {/* Calculate staker earning */}
                    {
                        calcResult ? (
                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} sm={24} style={{ marginBottom: 20 }}>
                                <List>
                                    <List.Item>
                                        <FlexboxGrid justify="start" align="middle">
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={24} xs={24}>
                                                <div className="property-title fs-24">Calculate Your Earnings</div>
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </List.Item>
                                    <List.Item>
                                        <FlexboxGrid justify="start" align="middle">
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-title">30 days</div>
                                            </FlexboxGrid.Item>
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-content">
                                                    {numberFormat(calcResult._30days, 0)} KAI
                                                </div>
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </List.Item>
                                    <List.Item>
                                        <FlexboxGrid justify="start" align="middle">
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-title">90 days</div>
                                            </FlexboxGrid.Item>
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-content">
                                                    {numberFormat(calcResult._90days, 0)} KAI
                                                </div>
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </List.Item>
                                    <List.Item>
                                        <FlexboxGrid justify="start" align="middle">
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-title">180 days</div>
                                            </FlexboxGrid.Item>
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-content">
                                                    {numberFormat(calcResult._180days, 0)} KAI
                                                </div>
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </List.Item>
                                    <List.Item>
                                        <FlexboxGrid justify="start" align="middle">
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-title">365 days</div>
                                            </FlexboxGrid.Item>
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-content">
                                                    {numberFormat(calcResult._365days, 0)} KAI
                                                </div>
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </List.Item>
                                    <List.Item>
                                        <FlexboxGrid justify="start" align="middle">
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-title">
                                                    <span>APR (%)</span> <Helper style={{ marginLeft: 5 }} info={'Might be change in real-time'} />
                                                </div>
                                            </FlexboxGrid.Item>
                                            <FlexboxGrid.Item componentClass={Col} colspan={24} md={12} xs={24}>
                                                <div className="property-content">
                                                    {numberFormat(calcResult._apr, 2)}
                                                </div>
                                            </FlexboxGrid.Item>
                                        </FlexboxGrid>
                                    </List.Item>
                                </List>
                            </FlexboxGrid.Item>
                        ) : <> </>
                    }
                </FlexboxGrid>
            </Modal.Body>
            <Modal.Footer>
                <Button className="kai-button-gray" onClick={reset}>
                    Reset
                </Button>
                <Button loading={isLoading} disable={validator && validator.address ? false : true} onClick={calculate}>
                    Calculate
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default StakingCalculator