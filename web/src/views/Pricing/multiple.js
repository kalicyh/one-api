import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { showError, showSuccess } from 'utils/common';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import PerfectScrollbar from 'react-perfect-scrollbar';

import { Card } from '@mui/material';
import PricesTableRow from './component/TableRow';
import KeywordTableHead from 'ui-component/TableHead';
import { API } from 'utils/api';
import EditeModal from './component/EditModal';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------
export default function Multiple({ ownedby, prices, reloadData, noPriceModel }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [editPricesItem, setEditPricesItem] = useState(null);

  // 处理刷新
  const handleRefresh = async () => {
    reloadData();
  };

  useEffect(() => {
    const grouped = prices.reduce((acc, item, index) => {
      const key = `${item.type}-${item.channel_type}-${item.input}-${item.output}`;

      if (!acc[key]) {
        acc[key] = {
          ...item,
          models: [item.model],
          id: index + 1
        };
      } else {
        acc[key].models.push(item.model);
      }
      return acc;
    }, {});

    setRows(Object.values(grouped));
  }, [prices]);

  const managePrices = async (item, action) => {
    let res;
    try {
      switch (action) {
        case 'delete':
          res = await API.put('/api/prices/multiple/delete', {
            models: item.models
          });
          break;
      }
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('userPage.operationSuccess'));
        if (action === 'delete') {
          await handleRefresh();
        }
      } else {
        showError(message);
      }

      return res.data;
    } catch (error) {
      return;
    }
  };

  const handleOpenModal = (item) => {
    setEditPricesItem(item);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditPricesItem(null);
  };

  const handleOkModal = (status) => {
    if (status === true) {
      handleCloseModal();
      handleRefresh();
    }
  };

  return (
    <>
      <Card>
        <PerfectScrollbar component="div">
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <KeywordTableHead
                headLabel={[
                  { id: 'collapse', label: '', disableSort: true },
                  { id: 'type', label: t('pricing_edit.type'), disableSort: true },
                  { id: 'channel_type', label: t('modelpricePage.channelType'), disableSort: true },
                  { id: 'input', label: t('modelpricePage.inputMultiplier'), disableSort: true },
                  { id: 'output', label: t('modelpricePage.outputMultiplier'), disableSort: true },
                  { id: 'count', label: t('pricingPage.ModelCount'), disableSort: true },
                  { id: 'action', label: t('paymentGatewayPage.tableHeaders.action'), disableSort: true }
                ]}
              />
              <TableBody>
                {rows.map((row) => (
                  <PricesTableRow
                    item={row}
                    managePrices={managePrices}
                    key={row.id}
                    handleOpenModal={handleOpenModal}
                    setModalPricesItem={setEditPricesItem}
                    ownedby={ownedby}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </PerfectScrollbar>
      </Card>
      <EditeModal
        open={openModal}
        onCancel={handleCloseModal}
        onOk={handleOkModal}
        pricesItem={editPricesItem}
        ownedby={ownedby}
        noPriceModel={noPriceModel}
      />
    </>
  );
}

Multiple.propTypes = {
  prices: PropTypes.array,
  ownedby: PropTypes.array,
  reloadData: PropTypes.func,
  noPriceModel: PropTypes.array
};
