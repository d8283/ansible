class FilterModule(object):
    def filters(self):
        return {
            'str_concat': self.str_concat,
            'str_substr': self.str_substr,
            'sanitize_tag_name': self.sanitize_tag_name,
        }

    def sanitize_tag_name(self, a):
        import re
        return re.sub('[^\w]', '_', a)

    def str_concat(self, a, b):
        return a + b

    def str_substr(self, a, *tuple):
        if (len(tuple) == 1):
            return a[tuple[0]:]
        elif (len(tuple) > 1):
            return a[tuple[0]:tuple[1]]
        else:
            return a
