import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Input, InputGroup, Button } from 'rsuite';
import { getTxByHash } from '../../../service/kai-explorer';
import { getBlockBy, getLatestBlockNumber } from '../../../service/kai-explorer/block';
import { addressValid, hashValid } from '../../utils/validate';

const SearchSection = () => {
    const [searchInput, setSearchInput] = useState('')
    const history = useHistory()

    const handleOnchange = (value: string) => {
        setSearchInput(value.trim())
    }

    // Search apply for many case
    // -- search by address --> show address details
    // -- search by txhash --> show transaction details
    // -- search by block hash or block height ---> show block details
    const search = async () => {
        if (!searchInput) return;
        const searchType = await checkSearchType(searchInput);
        switch (searchType) {
            case 'blockheight':
                history.push(`/block/${searchInput}`)
                break;
            case 'txhash':
                history.push(`/tx/${searchInput}`)
                break;
            case 'blockhash':
                history.push(`/block/${searchInput}`)
                break
            case 'address':
                history.push(`/address/${searchInput}`)
                break;
            default:
                setSearchInput('')
                break;
        }
        setSearchInput('')
    }

    const checkSearchType = async (input: string): Promise<string> => {

        if (addressValid(input)) {
            return 'address'
        }
        const isTxHash = await txHashAvailable(input)
        if (hashValid(input) && isTxHash) {
            return 'txhash'
        }
        const isBlock = await blockHashAvailable(input)
        if (hashValid(input) && isBlock) {
            return 'blockhash'
        }
        const availableBock = await blockHeightAvaiable(Number(input))
        if (Number.isInteger(Number(input)) && availableBock) {
            return 'blockheight'
        }
        return '';
    }

    const txHashAvailable = async (hash: string): Promise<boolean> => {
        const tx = await getTxByHash(hash);
        if(tx.txHash) {
            return true
        }
        return false
    }

    const blockHashAvailable = async (hash: string): Promise<boolean> => {
        const block = await getBlockBy(hash)
        if(block.blockHash) {
            return true
        }
        return false
    }

    const blockHeightAvaiable = async (blockHash: number): Promise<boolean> => {
        const latestBlock = await getLatestBlockNumber()
        if(blockHash <= Number(latestBlock)) {
            return true
        }
        return false;
    }

    return (
        <div className="search-wrapper">
            <InputGroup inside>
                <Input
                    placeholder="Search by Address / TxHash / BlockHash ..."
                    value={searchInput}
                    onChange={(value: string) => {handleOnchange(value) }}
                    onPressEnter={search}
                />
                    <Button onClick={search} className="btn-search">Search</Button>
            </InputGroup>
        </div>
    )
};

export default SearchSection;