class FilterModule(object):
    def filters(self):
        return {
            'str_concat': self.str_concat,
            'str_substr': self.str_substr,
            'str_split_space': self.str_split_space,
        }

    def str_concat(self, a, b):
        return a + b

    def str_substr(self, a, *tuple):
        if (len(tuple) == 1):
            return a[tuple[0]:]
        elif (len(tuple) > 1):
            return a[tuple[0]:tuple[1]]
        else:
            return a

    def str_split_space(self, string):
        return string.strip().split()
