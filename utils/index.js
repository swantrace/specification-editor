import merge from "lodash.merge";
import groupBy from "lodash.groupby";
import deepcopy from "deepcopy";

export const getProductSpecificationInfoWithValues = (
  product,
  specificationInfo
) => {
  const copiedSpecificationInfo = deepcopy(specificationInfo);
  const existingSpecificationTagKeyValuePairs =
    product?.tags
      ?.map((tag) => tag.split("_"))
      ?.filter((parts) => parts[0] === "dtm" && parts[1] != undefined)
      ?.reduce((acc, parts) => {
        acc[parts[1]] = { value: parts[2] ?? "TRUE" };
        return acc;
      }, {}) ?? {};
  const existingSpecificationMetafieldKeyValuePairs = Object.entries(
    JSON.parse(product?.metafield?.value ?? "{}")
  ).reduce((acc, [key, value]) => {
    acc[key] = { value };
    return acc;
  }, {});
  const existingSpecificationKeyValuePairs = {
    ...existingSpecificationTagKeyValuePairs,
    ...existingSpecificationMetafieldKeyValuePairs,
  };
  const specificationInfoWithValuesMerged = merge(
    copiedSpecificationInfo,
    existingSpecificationKeyValuePairs
  );
  return specificationInfoWithValuesMerged;
};

export const getViewProductsTableInfo = (products, specificationInfo) => {
  const productsSpecificationInfoWithValues = deepcopy(specificationInfo);
  const rows = [];
  products.forEach((product, productIndex) => {
    rows[productIndex] = [];
    rows[productIndex][0] = product.title ?? "";
    const productSpecificationInfoWithValues = getProductSpecificationInfoWithValues(
      product,
      specificationInfo
    );
    Object.keys(productsSpecificationInfoWithValues).forEach(
      (specificationName, specificationIndex) => {
        rows[productIndex][specificationIndex + 1] =
          productSpecificationInfoWithValues[specificationName].value;
      }
    );
  });
  return {
    columnContentTypes: [
      "text",
      ...Object.values(productsSpecificationInfoWithValues).map((info) =>
        info.type === "number" ? "numeric" : "text"
      ),
    ],
    headings: [
      "Title",
      ...Object.values(productsSpecificationInfoWithValues).map(
        (info) => info.label
      ),
    ],
    rows,
  };
};

export const getSpecificationGroups = (product, specificationInfo) => {
  const specificationInfoWithValuesMerged = getProductSpecificationInfoWithValues(
    product,
    specificationInfo
  );

  const {
    true: storedSpecifications,
    false: nonstoredSpecifications,
  } = groupBy(
    specificationInfoWithValuesMerged,
    (specification) => specification.value !== undefined
  );
  return {
    storedSpecifications: storedSpecifications ?? [],
    nonstoredSpecifications: nonstoredSpecifications ?? [],
  };
};

export const getModalEditingProductUpdateInfo = (
  toBeSubmittedValues,
  product,
  specificationInfo
) => {
  const specificationInfoWithValuesMerged = getProductSpecificationInfoWithValues(
    product,
    specificationInfo
  );

  const updateInfo = Object.entries(specificationInfoWithValuesMerged).reduce(
    (acc, [specificationName, specificationProps]) => {
      if (specificationProps.position === "tag") {
        if (
          specificationProps.value &&
          (!toBeSubmittedValues[specificationName] ||
            toBeSubmittedValues[specificationName] !== specificationProps.value)
        ) {
          acc.tagsToRemove = [
            ...acc.tagsToRemove,
            `dtm_${specificationName}${
              specificationProps.type === "checkbox"
                ? ""
                : `_${specificationProps.value}`
            }`,
          ];
        }
        if (
          specificationProps.type !== "checkbox" &&
          toBeSubmittedValues[specificationName] &&
          (!specificationProps.value ||
            specificationProps.value !== toBeSubmittedValues[specificationName])
        ) {
          acc.tagsToAdd = [
            ...acc.tagsToAdd,
            `dtm_${specificationName}_${toBeSubmittedValues[specificationName]}`,
          ];
        }
        if (
          specificationProps.type === "checkbox" &&
          (toBeSubmittedValues[specificationName] ?? "").toUpperCase() ===
            "TRUE" &&
          (!specificationProps.value ||
            specificationProps.value !== toBeSubmittedValues[specificationName])
        ) {
          acc.tagsToAdd = [...acc.tagsToAdd, `dtm_${specificationName}`];
        }
      }
      if (specificationProps.position === "metafield") {
        if (
          specificationProps.value &&
          !toBeSubmittedValues[specificationName]
        ) {
          acc.metafieldIsChanged = true;
        }
        if (
          !specificationProps.value &&
          toBeSubmittedValues[specificationName]
        ) {
          acc.metafieldIsChanged = true;
          acc.metafieldToUpdate[specificationName] = toBeSubmittedValues[
            specificationName
          ].split("\n");
        }
        if (
          specificationProps.value &&
          toBeSubmittedValues[specificationName]
        ) {
          if (
            JSON.stringify(
              toBeSubmittedValues[specificationName].split("\n")
            ) !== JSON.stringify(specificationProps.value)
          ) {
            acc.metafieldIsChanged = true;
            acc.metafieldToUpdate[specificationName] = toBeSubmittedValues[
              specificationName
            ].split("\n");
          }
        }
      }
      return acc;
    },
    {
      tagsToRemove: [],
      tagsToAdd: [],
      metafieldIsChanged: false,
      metafieldToUpdate: JSON.parse(product?.metafield?.value ?? "{}"),
    }
  );
  return updateInfo;
};

export const getProductInfoToExport = (product, specificationInfo) => {
  const specificationInfoWithValuesMerged = getProductSpecificationInfoWithValues(
    product,
    specificationInfo
  );
  const specificationValuePairs = Object.entries(
    specificationInfoWithValuesMerged
  ).reduce((acc, [specificationName, specificationProps]) => {
    if (specificationProps.value) {
      if (typeof specificationProps.value === "string") {
        acc[specificationName] = specificationProps.value;
      }
      if (specificationProps.value instanceof Array) {
        acc[specificationName] = specificationProps.value.join("\n");
      }
    } else {
      acc[specificationName] = "";
    }
    return acc;
  }, {});
  const productInfoToExport = {
    id: product.id,
    title: product.title,
    ...specificationValuePairs,
  };
  return productInfoToExport;
};

export const addslashes = (str) => {
  return (str + "").replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
};

export const titleCase = (string) => {
  return string
    .toLowerCase()
    .split(" ")
    .map((word) => word.replace(word[0], word[0].toUpperCase()))
    .join("");
};

export const getDownloadLink = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  const clickHandler = function () {
    setTimeout(() => {
      // Release the object URL
      URL.revokeObjectURL(url);

      // Remove the event listener from the anchor element
      this.removeEventListener("click", clickHandler);

      // Remove the anchor element from the DOM
      (this.remove && (this.remove(), 1)) ||
        (this.parentNode && this.parentNode.removeChild(this));
    }, 150);
  };
  a.addEventListener("click", clickHandler, false);
  return a;
};

export const getProductInputPayload = (
  toBeSubmittedValues,
  product,
  specificationInfo
) => {
  const {
    tagsToRemove,
    tagsToAdd,
    metafieldIsChanged,
    metafieldToUpdate,
  } = getModalEditingProductUpdateInfo(
    toBeSubmittedValues,
    product,
    specificationInfo
  );

  const input = {
    id: product.id,
    tags: [
      ...product.tags.filter((tag) => !tagsToRemove.includes(tag)),
      ...tagsToAdd,
    ],
  };

  if (metafieldIsChanged) {
    input["metafields"] = {
      key: "info",
      namespace: "dtm",
      valueType: "JSON_STRING",
      value: JSON.stringify(metafieldToUpdate),
    };
    if (product?.metafield?.id) {
      input["metafields"]["id"] = product.metafield.id;
    }
  }
  return input;
};
