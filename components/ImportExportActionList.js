import { ActionList, Button, Popover } from '@shopify/polaris';
import { useCallback, useState } from 'react';
function ImportExportActionList() {
  const [active, setActive] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const handleImportedAction = useCallback(() => console.log('Imported action'), []);

  const handleExportedAction = useCallback(() => console.log('Exported action'), []);

  const activator = (
    <Button onClick={toggleActive} disclosure>
      More actions
    </Button>
  );

  return (
    <div style={{ height: '25px' }}>
      <Popover active={active} activator={activator} onClose={toggleActive}>
        <ActionList
          items={[
            {
              content: 'Import file',
              onAction: handleImportedAction
            },
            {
              content: 'Export file',
              onAction: handleExportedAction
            }
          ]}
        />
      </Popover>
    </div>
  );
}

export default ImportExportActionList;
