import { TextContainer, Stack, TextStyle, RadioButton } from '@shopify/polaris';
import PropTypes from 'prop-types';

function ExportProductsModalContent({
  modalExportIsWorking,
  modalExportScope,
  selectedItems,
  handleModalExportScopeChanged,
}) {
  return modalExportIsWorking ? (
    <TextContainer>
      <Stack alignment="center" distribution="center">
        <Stack.Item fill>
          <TextStyle>
            Export is working, please don&#39;t close the modal until it is
            finished
          </TextStyle>
        </Stack.Item>
      </Stack>
    </TextContainer>
  ) : (
    <Stack vertical>
      <RadioButton
        checked={modalExportScope === 'all'}
        label="All products"
        id="all"
        value="all"
        name="exportScope"
        onChange={handleModalExportScopeChanged}
      />
      <RadioButton
        checked={modalExportScope === 'page'}
        label="Current page"
        id="page"
        value="page"
        name="exportScope"
        onChange={handleModalExportScopeChanged}
      />
      <RadioButton
        checked={modalExportScope === 'selected'}
        label={`Selected: ${selectedItems.length} products`}
        id="selected"
        value="selected"
        name="exportScope"
        onChange={handleModalExportScopeChanged}
      />
    </Stack>
  );
}

ExportProductsModalContent.propTypes = {
  modalExportIsWorking: PropTypes.bool,
  modalExportScope: PropTypes.string,
  selectedItems: PropTypes.arrayOf(PropTypes.string),
  handleModalExportScopeChanged: PropTypes.func,
};

export default ExportProductsModalContent;
